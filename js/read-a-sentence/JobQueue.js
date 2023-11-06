class JobQueue {
    constructor() {
        this.queue = [];
        // workingData is the data shared between all jobs in the queue and
        // it might represent data that is complete/finished once all jobs are done
        // (and hence it's passed to the onFinish callback)
        this.workingData = null;
    }

    enqueue(job) {
        job.jobQueue = this;
        this.queue.push(job);
    }

    dequeue() {
        let dequeuedJob = this.queue.shift();
        dequeuedJob.jobQueue = null;
        return dequeuedJob;
    }

    firstJob() {
        return this.queue[0];
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    startJobs(onFinish) {
        this.onFinish = onFinish;
        this.executeNextJob();
    }

    executeNextJob() {
        if (this.isEmpty()) {
            this.onFinish();
            return;
        }
        this.firstJob().execute();
    }
}
