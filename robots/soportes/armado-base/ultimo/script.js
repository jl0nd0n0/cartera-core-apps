const fs = require('fs').promises;
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

/**
 * Worker thread logic: List all files and folders in a directory.
 */
async function workerTask(directory) {
  const results = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(`[Folder] ${fullPath}`);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

if (!isMainThread) {
  // Worker thread: Perform directory listing and send results back
  workerTask(workerData.directory)
    .then((results) => parentPort.postMessage(results))
    .catch((err) => parentPort.postMessage({ error: err.message }));
} else {
  /**
   * Main thread: Orchestrates scanning and spawning workers.
   */
  async function listDirectoryMultithreaded(directory) {
    const results = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });

    const workerPromises = [];
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        results.push(`[Folder] ${fullPath}`);

        // Spawn a worker thread for each subdirectory
        workerPromises.push(
          new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
              workerData: { directory: fullPath }
            });

            worker.on('message', (data) => {
              if (data.error) {
                reject(new Error(data.error));
              } else {
                resolve(data);
              }
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
              if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`));
              }
            });
          })
        );
      } else {
        results.push(fullPath);
      }
    }

    // Wait for all workers to finish
    const workerResults = await Promise.all(workerPromises);
    workerResults.forEach((workerData) => results.push(...workerData));

    return results;
  }

  /**
   * Main function to scan a folder and save results to a file.
   */
  async function main(initialFolder, outputFile) {
    try {
      console.log(`Scanning folder: ${initialFolder}`);
      const results = await listDirectoryMultithreaded(initialFolder);

      // Save results to output file
      await fs.writeFile(outputFile, results.join('\n'), 'utf8');
      console.log(`Results written to: ${outputFile}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }

  // Parse command-line arguments
  const folderToScan = process.argv[2] || __dirname; // Default to current directory
  const outputFile = process.argv[3] || path.join(__dirname, 'file_list_multithread.txt'); // Default output file

  main(folderToScan, outputFile);
}
