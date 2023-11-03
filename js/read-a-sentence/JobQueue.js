class JobQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(job) {
        this.queue.push(job);
    }

    dequeue() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}
