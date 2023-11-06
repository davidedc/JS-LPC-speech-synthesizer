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

}
