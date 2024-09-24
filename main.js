import {performance, PerformanceObserver} from 'perf_hooks';

import {generateSchemaFromCsv} from "./generate_type.js";
import {parseCsv} from "./parse_csv.js";
import {serializeSchema} from "./save_to_db.js";
import {logger} from "./logger.js";
import {WorkerPool} from "./worker_pool.js";
import {maxPool} from "./constants.js";

const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration} мс`);
    });
});
observer.observe({entryTypes: ['measure']});

async function main() {
    performance.mark('start');

    // https://github.com/datablist/sample-csv-files?tab=readme-ov-file
    const filePath = './data/customers-2000000.csv';
    const chunkSize = 100_000;
    const workerPool = new WorkerPool(logger, maxPool);

    workerPool.on('workerCompleted', (result) => {
        if (result.success) {
            logger.info(`Processed chunk ${result.countChunks}`);
        } else {
            logger.error(`Failed to process chunk ${result.countChunks}`);
        }
    });
    workerPool.on('end', (result) => {
        performance.mark('end');
        performance.measure('Parsed by', 'start', 'end');
    });

    const recordSchema = await generateSchemaFromCsv(logger, filePath);
    const serializedSchema = serializeSchema(recordSchema);

    const callbackParser = async (listOfLines, countChunks) => {
        workerPool.addTask({listOfLines, serializedSchema, countChunks, chunkSize})
    };
    await parseCsv(logger, filePath, callbackParser, chunkSize);
}

(async () => {
    await main();
})();


