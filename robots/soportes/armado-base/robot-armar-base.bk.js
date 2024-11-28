const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const fse = require('fs-extra');
const { exec } = require('child_process');

// Database configuration
const dbConfig = {
    host: '162.212.158.245', // Replace with your DB host
    user: 'admin',      // Replace with your DB username
    password: 'zyx**EzugOBhWWfTqb??hlvb08XAN606Oi',      // Replace with your DB password
    database: 'homi' // Replace with your DB name
};

// Folder to copy files to (from command-line argument)
const destinationFolder = process.argv[2];
if (!destinationFolder) {
    console.error('Usage: node script.js /path/to/destination_folder');
    process.exit(1);
}

// Ensure the destination folder exists
fse.ensureDirSync(destinationFolder);

// Path to the text file with invoice numbers
const invoiceFile = 'facturas.txt'; // Replace with the path to your file
if (!fs.existsSync(invoiceFile)) {
    console.error(`Invoice file not found: ${invoiceFile}`);
    process.exit(1);
}

// Read invoice numbers from file
const invoiceNumbers = fs.readFileSync(invoiceFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

if (invoiceNumbers.length === 0) {
    console.error('No invoice numbers found in file.');
    process.exit(1);
}

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database.');
    processInvoices();
});

function remove_linebreaks(str) {
    return str.replace(/[\r\n]+/gm, " ");
}

// Process each invoice number
function processInvoices() {
    let processed = 0;

    //#region ciclo
    invoiceNumbers.forEach(invoiceNumber => {
        console.log(`Processing invoice: ${invoiceNumber}`);

        //console.log(destinationFolder);
        //return false;

        const folder = destinationFolder + '/' + invoiceNumber;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
            console.log("directorio creado: " + folder);
        }

        // Query the database for file paths
        const sql = "select ruta_soporte as file_path, tipo_archivo from robot_repositorio_indice where ruta_soporte like '%" + invoiceNumber + "%'";
        //console.log(sql);
        //return false;

        const filePath = 'copy.bat';

        connection.query(
            sql,
            [invoiceNumber],
            (err, results) => {
                if (err) {
                    console.error(`Error querying database for invoice ${invoiceNumber}:`, err);
                    return;
                }

                let comando;

                results.forEach(row => {
                    const sourcePath = remove_linebreaks(row.file_path);
                    
                    /*
                    let source = sourcePath.trim();
                    source = source.replaceAll("*FLUJO EFECTIVO*", "\\");
                    source = source.replaceAll("*", "\\");

                    let target = './repositorio/' + invoiceNumber;
                    target = target.replaceAll("*", "\\");

                    console.log();
                    console.log("source: " + source);
                    console.log("target: " + target);
                    console.log(source, target);
                    */

                    /*
                    if (row.tipo_archivo == "file") {
                        console.log("copiando .... ");
                      // copy directory
                      fs.cp(source, target, { recursive: true }, (err) => {
                        if (err) {
                          console.error(err);
                        }
                      });
                    }
                    */

                    //console.log(row.file_path);
                    // comando = 'xcopy "' + sourcePath.trim() + '" ' + '"repositorio/' + invoiceNumber + '/" ' + '/s /e /i';
                    comando = 'xcopy "' + sourcePath.trim() + '" ' + '"repositorio/' + invoiceNumber + '/" ' + '/E /y';
                    //console.log(comando.indexOf("z:\"));
                    comando = comando.replaceAll("*FLUJO EFECTIVO*", "\\");
                    comando = comando.replaceAll("*", "\\");
                    //console.log(comando);

                    //console.log(comando);
                    //console.log();
                    console.log(comando);
                    //console.log();

                    /*
                    fs.writeFile(filePath, comando, (err) => {
                        if (err) {
                            console.error(`Error writing to file: ${err}`);
                        } else {
                            console.log(`File written and content replaced: ${filePath}`);
                        }
                    });
                    */

                    fs.writeFileSync(filePath, comando);

                    /*
                    const fs = require('fs-extra');

                    //import { copyFile, constants } from 'node:fs/promises';
                    async function copy(source, destination) {
                        try {
                            await fs.copyFile(source, destination, fs.constants.COPYFILE_FICLONE);
                            console.log(`Copied ${source} to ${destination}`);
                        } catch (error) {
                            console.error(`Error copying: ${error}`);
                        }
                    }
                    */

                    //copy(source, target);

                    /*
                    if (!fs.existsSync(sourcePath)) {
                      console.warn(`File not found: ${sourcePath}`);
                      return;
                    }
                    */

                    //const destinationPath = path.join(destinationFolder, path.basename(sourcePath));

                    // Copy the file
                    /*
                    try {
                      fs.copyFileSync(sourcePath, destinationPath);
                      console.log(`Copied: ${sourcePath} -> ${destinationPath}`);
                    } catch (copyErr) {
                      console.error(`Failed to copy ${sourcePath}:`, copyErr);
                    }
                    */


                });

                processed++;

                // Close the connection after processing all invoices
                if (processed === invoiceNumbers.length) {
                    connection.end(() => {
                        console.log('Database connection closed.');
                    });
                }
            }
        );
    });
    //#endregion ciclo

    process.exit();
}
