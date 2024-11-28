const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const fse = require('fs-extra');
//const { exec } = require('child_process');
const os = require('os');

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
let filePath;

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    //console.log('Connected to the database.');
    filePath = 'copy.bat';
    fs.writeFileSync(filePath, "", 'utf8');
    processInvoices();
    //process.exit();
});

function remove_linebreaks(str) {
    return str.replace(/[\r\n]+/gm, " ");
}

// Process each invoice number
function processInvoices() {
    let processed = 0;
    let prefijo;
    let numero;
    let pref;
    let num;

    //#region ciclo
    invoiceNumbers.forEach(invoiceNumber => {
        prefijo = invoiceNumber.split(";")[0];
        numero = invoiceNumber.split(";")[1];

        //console.log(`Processing invoice: ${numero}`);

        //console.log(destinationFolder);
        //return false;

        const folder = destinationFolder + '/' + prefijo + numero;
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
            console.log("directorio creado: " + folder);
        }

        // Query the database for file paths
        const sql = "select '" + prefijo + "' prefijo, '" + numero + "' numero, ruta_soporte as file_path, tipo_archivo from robot_repositorio_indice where ruta_soporte like '%" + numero + "%'";
        //console.log(sql);
        //return false;

        connection.query(
            sql,
            [numero],
            (err, results) => {
                if (err) {
                    console.error(`Error querying database for invoice ${numero}:`, err);
                    return;
                }

                let comando;

                results.forEach(row => {

                    /*
                    console.log("***");
                    console.log(row);
                    console.log("***");
                    return false;
                    */
                    
                    num = row.numero;
                    pref = row.prefijo;

                    const sourcePath = remove_linebreaks(row.file_path);

                    //console.log(row.tipo_archivo, sourcePath.trim());
                    
                    if (row.tipo_archivo == "folder") {
                        comando = 'copy "' + sourcePath.trim() + '\%%" ' + '"repositorio/' + pref + num + '/" ' + '/y';
                    }
                    else {
                        comando = 'copy "' + sourcePath.trim() + '" "repositorio/' + pref + num + '/" ' + '/y';
                    }
                    //console.log(row.file_path);
                    // comando = 'xcopy "' + sourcePath.trim() + '" ' + '"repositorio/' + invoiceNumber + '/" ' + '/s /e /i';
                    
                    //console.log(comando.indexOf("z:\"));
                    comando = comando.replaceAll("*FLUJO EFECTIVO*", "\\");
                    comando = comando.replaceAll("*", "\\");
                    comando = comando.replaceAll("%%", "\\*");
                    //console.log(comando);

                    //console.log(comando);
                    //console.log();
                    console.log(comando);
                    //console.log();

                    fs.appendFileSync(filePath, comando + os.EOL, 'utf8');
                });

                processed++;

                // Close the connection after processing all invoices
                if (processed === invoiceNumbers.length) {
                    connection.end(() => {
                        //console.log('Database connection closed.');
                    });
                }
            }
        );
    });
    //#endregion ciclo

    
}
