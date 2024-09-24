import {parentPort, workerData} from 'worker_threads';

import {logger} from "./logger.js";
import {validateRows} from "./validator.js";
import {connectDB, saveToDb, closeConnectDB} from "./save_to_db.js";


export async function task(listOfLines, serializedSchema, countChunks, chunkSize) {
    const mongoUri = 'mongodb://root:password@127.0.0.1:27017'
    await connectDB(logger, mongoUri)

    logger.info(`Processing chunk ${countChunks}, total=${countChunks * chunkSize} lines`);
    try {
        logger.info(`Validating chunk ${countChunks}`)
        const validatedData = validateRows(logger, listOfLines, serializedSchema);
        logger.info(`Validated chunk ${countChunks}`)

        if (validatedData.length) {
            logger.info(`Inserting chunk ${countChunks}`)
            await saveToDb(logger, validatedData, serializedSchema)
        }

        logger.info(`Processed chunk ${countChunks}`);
        parentPort.postMessage({success: true, countChunks});
    } catch (err) {
        logger.error(`Error while saving chunk=${countChunks}`, err);
        parentPort.postMessage({success: false, countChunks});
    } finally {
        await closeConnectDB()
    }
}

const {listOfLines, serializedSchema, countChunks, chunkSize} = workerData
await task(listOfLines, serializedSchema, countChunks, chunkSize);