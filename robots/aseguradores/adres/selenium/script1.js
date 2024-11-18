const {By, Builder, Browser} = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');

const assert = require("assert");

(async function firstTest() {
	const config = require('./config.json');
	console.log(config.server_login);
	
	let driver;
  
	try {
		//driver = await new Builder().forBrowser(Browser.CHROME).build();
		driver = await new Builder().forBrowser(Browser.EDGE).build();
		await driver.get(config.server_login);
		
		await driver.findElement(By.id('userName')).sendKeys('899999123'); // Replace 'username'
		await driver.findElement(By.id('password')).sendKeys('1d$V035{4)&b'); // Replace 'username'
		
		
		
		  
		
	  } catch (e) {
		console.log(e)
	  } finally {
		//await driver.quit();
	  }
}())