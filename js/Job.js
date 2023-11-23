class Job {

    execute() {
        throw new Error("Execute method should be implemented by subclasses.");
    }

    success() {
        let jobQueue = this.jobQueue;
        let job = jobQueue.dequeue();
        if (jobQueue.isEmpty()) {
            jobQueue.onFinish(jobQueue.workingData);
            return;
        }
        jobQueue.executeNextJob();
    }

    isFirstJob() {
        return this.jobQueue.firstJob() === this;
    }

    isLastJob() {
        return this.jobQueue.lastJob() === this;
    }

    isPenuiltimateJob() {
        return this.jobQueue.penuiltimateJob() === this;
    }

    /*
    // find the job next to this one in the job queue.
    // if this is the last job, then return null
    getNextJob() {
        let jobQueue = this.jobQueue;
        let jobIndex = jobQueue.queue.indexOf(this);
        if (jobIndex === jobQueue.queue.length - 1) {
            return null;
        }
        return jobQueue.queue[jobIndex + 1];
    }
    */

}
