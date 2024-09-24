import fs from "fs";
import readline from "readline";
import {parseColumnName, parseValue} from "./parse_csv.js";

function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

export async function generateSchemaFromCsv(logger, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const headers = [];
    const recordSchema = {};
    let isFirstLine = true;
    const maxLinesRead = 2;
    let linesRead = 0;

    for await (const line of rl) {
        if (isFirstLine) {
            const columns = line.split(',')
                .filter(Boolean)
                .map(name_column => parseColumnName(name_column));
            //Check if it is not a name of page
            if (columns.length !== 1) {
                isFirstLine = false;
                headers.push(...columns);
            }
        } else {
            const values = parseLine(line.trim());


            values.forEach((value, index) => {
                if (!headers[index]) {
                    headers[index] = parseColumnName(value, index);
                }
                const header = headers[index];
                const trimmedValue = parseValue(value);
                if (trimmedValue.length) {
                    const isNumeric = !isNaN(Number(trimmedValue))
                    recordSchema[header] = {type: isNumeric ? Number : String, required: true}
                } else {
                    recordSchema[header] = {type: String, required: false};
                }
            })

            linesRead++
            if (linesRead === maxLinesRead) {
                fileStream.close();
                rl.close();
                rl.removeAllListeners();
                break
            }
        }
    }

    return recordSchema;
}