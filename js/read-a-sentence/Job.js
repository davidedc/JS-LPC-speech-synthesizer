class Job {
    constructor(data) {
        this.data = data;
    }

    execute(onSuccess, onError) {
        throw new Error("Execute method should be implemented by subclasses.");
    }
}
