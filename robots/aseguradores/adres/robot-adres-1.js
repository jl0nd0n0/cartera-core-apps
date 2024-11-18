const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
let data = new FormData();
data.append('userName', '899999123');
data.append('password', '1d$V035{4)&b');

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://aplicaciones.adres.gov.co/SII_ECAT_WEB/reportes/Login.aspx',
  headers: { 
    'Cookie': 'cookiesession1=678B28AEFA5DEA77520462D628E23322', 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
	.then((response) => {
	  //console.log(JSON.stringify(response.data));

		const fileUrl = 'https://aplicaciones.adres.gov.co/WEB_ECAT/Global/Formularios/FormReportes.aspx?NombreReporte=ReporteReclamacionesPersonasJuridicas&Nit=899999123&Annio=2024';
		axios.get(fileUrl, {
            headers: { Cookie: 'cookiesession1=678B28AEFA5DEA77520462D628E23322' },
            responseType: 'arraybuffer', // To ensure binary file data
        }).then((response_file) => {
			console.log(response_file);
			
			// Save the Excel file locally
			/*
			const downloadDir = path.join(__dirname, 'downloads');
			if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

			const filePath = path.join(downloadDir, 'downloaded-file.xlsx');
			fs.writeFileSync(filePath, response_file.data);
			console.log(`File downloaded successfully: ${filePath}`);
			*/
			
			fs.writeFileSync("./excel.xlsx", response_file.data);
		});
	})
	.catch((error) => {
	  console.log(error);
	});
