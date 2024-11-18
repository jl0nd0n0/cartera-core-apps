const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const numThreads = os.cpus().length;  // Number of CPU cores to spawn worker threads

// Recursive function to list directories and files
function listDirectory(dirPath, level, fileStream) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${dirPath}`);
            return;
        }

        files.forEach(file => {
            // Full path of the file or directory
            const fullPath = path.join(dirPath, file.name);

            // Indentation based on depth (level)
            //const indentation = ''.repeat(level * 4);
			const indentation = '';
            fileStream.write(`${indentation}${fullPath}\n`);

            // If it's a directory, process it recursively
            if (file.isDirectory()) {
                // Spawn worker threads for parallel processing
                if (isMainThread) {
                    const worker = new Worker(__filename, {
                        workerData: { dirPath: fullPath, level: level + 1 }
                    });

                    worker.on('message', () => {});
                    worker.on('error', (error) => console.error(error));
                    worker.on('exit', (code) => {
                        if (code !== 0) {
                            console.error(`Worker stopped with exit code ${code}`);
                        }
                    });
                } else {
                    listDirectory(workerData.dirPath, workerData.level, fileStream);
                }
            }
        });
    });
}

// Main thread starts here
if (isMainThread) {
    const directoryPath = process.argv[2] || '.';  // Default to current directory
    const outputFilePath = 'directory_structure.txt';

    // Open the output file stream
    const fileStream = fs.createWriteStream(outputFilePath, { flags: 'w' });

    // Start the listing process in the main thread
    console.log('Listing directory structure...');
    listDirectory(directoryPath, 0, fileStream);

    // Close the file stream when done
    fileStream.end(() => {
        console.log(`Directory structure saved in ${outputFilePath}`);
    });
} else {
    // This is for worker threads to run the listDirectory function
    listDirectory(workerData.dirPath, workerData.level, fs.createWriteStream('directory_structure.txt', { flags: 'a' }));
}
