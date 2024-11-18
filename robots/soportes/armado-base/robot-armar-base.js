const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const fse = require('fs-extra');

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
const invoiceFile = 'invoices.txt'; // Replace with the path to your file
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

  invoiceNumbers.forEach(invoiceNumber => {
	console.log(`Processing invoice: ${invoiceNumber}`);

	if (!fs.existsSync(destinationFolder + invoiceNumber)) {
		fs.mkdirSync(destinationFolder + invoiceNumber);
		console.log("directorio creado: " + invoiceNumber);
	}

    
    // Query the database for file paths
	const sql = "select ruta_soporte as file_path from temporal_soportes_robot where ruta_soporte like '%" + invoiceNumber + "%'";
	//console.log(sql);
	//return false;
	
    connection.query(
      sql,
      [invoiceNumber],
      (err, results) => {
        if (err) {
          console.error(`Error querying database for invoice ${invoiceNumber}:`, err);
          return;
        }

        results.forEach(row => {
          const sourcePath = remove_linebreaks(row.file_path);
		  console.log('xcopy "' + sourcePath.trim() + '" ' + '"repositorio/' + invoiceNumber + '/" ' + '/s /e /i');

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
}