const fs = require('fs').promises;
const path = require('path');

// Function to copy files from the list to the destination folder
async function copyFiles(fileList, destinationFolder) {
    try {
        // Ensure the destination folder exists, create if not
        await fs.mkdir(destinationFolder, { recursive: true });

        const files = await fs.readFile(fileList, 'utf-8');
        const filePaths = files.split('\n').filter(line => line.trim() !== '');

        for (let filePath of filePaths) {
            const sourcePath = filePath.trim();
            const fileName = path.basename(sourcePath); // Extracts the file name
            const destinationPath = path.join(destinationFolder, fileName);

            try {
                // Check if the source file exists
                await fs.access(sourcePath);

                // Copy the file to the destination folder
                await fs.copyFile(sourcePath, destinationPath);
                console.log(`File copied: ${sourcePath} -> ${destinationPath}`);
            } catch (err) {
                console.error(`Error copying file: ${sourcePath}`, err);
            }
        }

        console.log('File copying process completed!');
    } catch (err) {
        console.error('Error reading the file list or processing files:', err);
    }
}

// Main function to read the file list and start the copying process
async function main() {
    const fileListPath = 'files_list.txt'; // File containing the list of file paths
    const destinationFolder = 'copied_files'; // Folder to copy files into

    await copyFiles(fileListPath, destinationFolder);
}

main();
