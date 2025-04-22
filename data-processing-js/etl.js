const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const fetch = require('node-fetch');
const csvtojson = require('csvtojson');
const XLSX = require('xlsx');

async function downloadFile(url, outputPath) {
    try {
        const response = await fetch(url);
        const fileStream = fs.createWriteStream(outputPath);
        await new Promise((resolve, reject) => {
            response.body.pipe(fileStream);
            response.body.on('error', reject);
            fileStream.on('finish', resolve);
        });
        console.log(`File downloaded to ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error downloading file: ${error.message}`);
        throw error;
    }
}

async function parseCSV(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return new Promise((resolve, reject) => {
            Papa.parse(fileContent, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    console.log(`CSV parsed: ${results.data.length} rows`);
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Error parsing CSV: ${error.message}`);
        throw error;
    }
}

async function csvToJSON(filePath) {
    try {
        const jsonArray = await csvtojson().fromFile(filePath);
        console.log(`CSV converted to JSON: ${jsonArray.length} items`);
        return jsonArray;
    } catch (error) {
        console.error(`Error converting CSV to JSON: ${error.message}`);
        throw error;
    }
}

function parseExcel(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        const result = {};

        sheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            result[sheetName] = XLSX.utils.sheet_to_json(sheet);
        });

        console.log(`Excel parsed: ${Object.keys(result).length} sheets`);
        return result;
    } catch (error) {
        console.error(`Error parsing Excel: ${error.message}`);
        throw error;
    }
}

async function main() {
    try {
        const houseDataUrl = 'https://www.data.gouv.fr/fr/datasets/r/...'
        const houseDataPath = path.join(__dirname, 'data', 'housing_data.csv');

        if (!fs.existsSync(path.join(__dirname, 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'data'));
        }

        await downloadFile(houseDataUrl, houseDataPath);
        const houseData = await parseCSV(houseDataPath);

        const parisData = houseData.filter(item => item.region === 'Île-de-France');

        fs.writeFileSync(
            path.join(__dirname, 'data', 'paris_housing.json'),
            JSON.stringify(parisData, null, 2)
        );

        console.log('ETL process completed successfully');
    } catch (error) {
        console.error(`ETL process failed: ${error.message}`);
    }
}

// Uncomment to run the ETL process
// main();

module.exports = {
    downloadFile,
    parseCSV,
    csvToJSON,
    parseExcel
};