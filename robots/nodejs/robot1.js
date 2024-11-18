const fs = require('fs').promises;
const fss = require('node:fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Function to recursively list directories and files
async function listDirectoriesAndFiles(dirPath, level, fileStream) {
    try {
		//console.log(dirPath);
		
		if (!fss.existsSync(dirPath)) {
			console.log(dirPath);
			console.log("NO EXISTE EL DIRECTORIO");			
		}
		else {
			const files = await fs.readdir(dirPath, { withFileTypes: true });

			for (const file of files) {
				// Full path of the file or directory
				const fullPath = path.join(dirPath, file.name);			

				// Indentation based on depth (level)
				//const indentation = ' '.repeat(level * 4);
				const indentation = '';
				await fs.appendFile(fileStream, `${indentation}${fullPath}\n`);

				// If it's a directory, process it recursively
				if (file.isDirectory()) {
					await listDirectoriesAndFiles(fullPath, level + 1, fileStream);
				}
			}
		}
    } catch (error) {
        console.error(`Error reading directory: ${dirPath}`, error);
    }
}

// Worker thread logic
if (!isMainThread) {
    async function processDirectory() {
        const { dirPath, level, fileStream } = workerData;

        // Append the current folder being processed
        //await fs.appendFile(fileStream, `\nProcessing folder: ${dirPath}\n`);
        await listDirectoriesAndFiles(dirPath, level, fileStream);
    }

    processDirectory().then(() => {
        parentPort.postMessage('done');
    }).catch(err => {
        parentPort.postMessage('error');
        console.error(err);
    });

} else {
    // Function to read the file with folder paths and process each folder
    async function processFoldersFromFile(pathInit, fileWithPaths, outputFile) {
        try {
            // Read the folder list from the input file
            const folders = await fs.readFile(fileWithPaths, 'utf-8');
            const folderPaths = folders.split('\n').filter(line => line.trim() !== '');
            
            const fileStream = outputFile ? outputFile : 'directory_structure.txt';

            // Creating an array to hold worker threads
            const workers = [];

            // Iterate over each folder and spawn worker threads
            for (const folderPath of folderPaths) {
				//console.log('"' + path + folderPath.trim() + '"');
				//break;
				const worker = new Worker(__filename, {
                    workerData: { dirPath: pathInit + folderPath.trim(), level: 0, fileStream }
					//workerData: { dirPath: '"' + path + folderPath.trim() + '"', level: 0, fileStream }
                });

                // Listen to worker messages
                worker.on('message', message => {
                    if (message === 'done') {
                        //console.log(`Worker finished processing folder: ${folderPath.trim()}`);
                    } else if (message === 'error') {
                        console.error(`Error in worker processing folder: ${folderPath.trim()}`);
                    }
                });

                // Collect the worker to ensure proper cleanup
                workers.push(worker);
            }

            // Wait for all workers to finish
            for (const worker of workers) {
                await new Promise(resolve => worker.on('exit', resolve));
            }

            console.log('All directories and files processed successfully!');
        } catch (error) {
            console.error('Error processing the file with folder names:', error);
        }
    }

    // Main function to start the process
    async function main() {
        const folderListFile = 'folder_list.txt';  // File containing the list of folder paths
        const outputFile = 'directory_structure.txt'; // File to save the structure
		const pathInit = "Z:\\FLUJO EFECTIVO\\";

        await processFoldersFromFile(pathInit, folderListFile, outputFile);
    }

    main();
}
