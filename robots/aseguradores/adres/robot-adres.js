const axios = require('axios');
const qs = require('qs'); // For encoding form data
const fs = require('fs');
const path = require('path');

(async function loginAndDownloadExcel() {
    try {
        // Step 1: Define login and file URLs
        const loginUrl = 'https://aplicaciones.adres.gov.co/SII_ECAT_WEB/reportes/Login.aspx'; // Replace with your login endpoint
        const fileUrl = 'https://your-aspnet-app.com/protected/download-file'; // Replace with your file URL

        // Step 2: Send login request
        console.log("Logging in...");

        const loginData = {
            userName: '899999123', // Replace with your username field name
            password: '1d$V035{4)&b', // Replace with your password field name
        };

        // Use `qs.stringify` to encode form data properly
        const loginResponse = await axios.post(loginUrl, qs.stringify(loginData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Extract cookies from the response
		console.log(loginResponse);
        const cookies = loginResponse.headers['set-cookie'];
        if (!cookies) {
            console.error("Failed to retrieve cookies. Check login credentials or endpoint.");
            return;
        }
		
		console.log(cookies);

        // Convert cookies into a single `Cookie` header string
        const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        console.log("Login successful. Retrieved cookies:", cookieHeader);

        // Step 3: Download the Excel file
        console.log("Downloading Excel file...");

        const response = await axios.get(fileUrl, {
            headers: { Cookie: cookieHeader },
            responseType: 'arraybuffer', // To ensure binary file data
        });

        // Save the Excel file locally
        const downloadDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

        const filePath = path.join(downloadDir, 'downloaded-file.xlsx');
        fs.writeFileSync(filePath, response.data);
        console.log(`File downloaded successfully: ${filePath}`);

    } catch (error) {
        console.error("An error occurred:", error.response ? error.response.data : error.message);
    }
})();