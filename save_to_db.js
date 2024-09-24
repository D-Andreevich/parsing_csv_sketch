import mongoose from "mongoose";
import {maxPool, types} from "./constants.js";

let modelMemo = {};

export const connectDB = async (logger, uri) => {
    try {
        await mongoose.connect(uri, {
            maxPoolSize: maxPool,
        });
        logger.info("MongoDB connected");
    } catch (error) {
        logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export const closeConnectDB = async () => {
    await mongoose.connection.close();
}

export function serializeSchema(schema) {
    const result = {}
    Object.keys(schema).forEach(key => {
        result[key] = {...schema[key], type: schema[key].type.name};
    });
    return result;
}

export function deserializeSchema(serializedSchema) {
    const result = {}
    Object.keys(serializedSchema).forEach(key => {
        if (!types[serializedSchema[key].type]) {
            throw new Error(`Unknown type "${serializedSchema[key].type}" for ${key}`);
        }
        result[key] = {...serializedSchema[key], type: types[serializedSchema[key].type]};
    });
    return result;
}

function getModel(modelName, recordSchema, collectionName) {
    if (modelMemo[modelName]) return modelMemo[modelName];
    let RecordModel;
    try {
        RecordModel = mongoose.model(modelName, recordSchema, collectionName);
    } catch (err) {
        throw Error(`Error getting model ${modelName}: `, err);
    }

    modelMemo[modelName] = RecordModel;
    return RecordModel;
}

export async function saveToDb(logger, results, serializedSchema, modelName = 'Record', collectionName = 'records') {
    try {
        const RecordModel = getModel(modelName, deserializeSchema(serializedSchema), collectionName);
        await RecordModel.insertMany(results);
        logger.info(`${results.length} records inserted into MongoDB`);
    } catch (error) {
        logger.error("Error inserting records:", error);
    }
}