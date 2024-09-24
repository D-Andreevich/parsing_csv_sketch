import {types} from "./constants.js";


function mapperInit(logger, recordSchema) {
    return function (row) {
        const result = {}
        Object.keys(recordSchema).forEach(function (fieldName) {
            const {type, required} = recordSchema[fieldName]
            if (row[fieldName]) {
                result[fieldName] = types[type](row[fieldName])
            } else {
                result[fieldName] = required ? '_' : null
            }
        })
        return result;
    }
}

export function validateRows(logger, listOfLines, recordSchema) {
    const result = []
    const mapper = mapperInit(logger, recordSchema);
    listOfLines.forEach((line) => {
        try {
            result.push(mapper(line));
        } catch (err) {
            logger.error(`Error while validate line ${line}`, err);
        }
    })
    return result;
}