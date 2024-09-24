import {Worker} from 'worker_threads'
import {EventEmitter} from 'events'

export class WorkerPool extends EventEmitter {
    constructor(logger, size) {
        super();
        this.logger = logger;
        this.maxSizeWorkers = size;
        this.queue = [];
        this.activeCount = 0;
    }

    createWorker(workerData) {
        const worker = new Worker('./task.js', {workerData});
        worker.on('message', (result) => {
            this.activeCount--;
            this.emit('workerCompleted', result);
            this.runNext();
        });

        worker.on('error', (error) => {
            this.logger.error('Worker error:', error);
            this.activeCount--;
            this.runNext();
        });

        return worker;
    }

    addTask(workerData) {
        this.queue.push(workerData);
        this.runNext()
    }

    runNext() {
        if (this.activeCount < this.maxSizeWorkers && this.queue.length > 0) {
            const workerData = this.queue.shift();
            this.createWorker(workerData);
            this.activeCount++;
        }
        if (this.activeCount === 0) {
            this.emit('end', {});
        }
    }
}