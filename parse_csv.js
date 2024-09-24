import fs from "fs";
import csv from 'csv-parser'

export const parseColumnName = (origColName, index) => {
    const newColName = origColName.trim().toLowerCase().replace(/\s/g, '_')
    if (!newColName) {
        return `no_name_${index + 1}`
    }
    return newColName
}
export const parseValue = (val) => val.trim()

export async function parseCsv(logger, filePath, callback, chunkSize = 1000) {
    return new Promise((resolve, reject) => {
        let results = [];
        let countChunks = 0;
        fs.createReadStream(filePath)
            .pipe(csv({
                // skipLines: 1,
                mapHeaders: ({header, index}) => parseColumnName(header, index),
                mapValues: ({header, index, value}) => parseValue(value)
            }))
            .on('data', (data) => {
                results.push({...data});
                if (results.length === chunkSize) {
                    countChunks++
                    callback(results, countChunks)
                    results = []
                }
            })
            .on('end', () => {
                logger.info(`Parsed ${filePath}, count ${countChunks * chunkSize} lines`);
                if (results.length) {
                    callback(results, countChunks)
                }
                resolve(true)
            })
            .on('error', (error) => {
                logger.error("Error reading CSV file:", error);
                reject(false);
            });
    })

}