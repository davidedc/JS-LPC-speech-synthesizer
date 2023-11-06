class LoadWordDataJob extends Job {

    constructor(wordAsString) {
        super();
        this.wordAsString = wordAsString;
    }

    execute() {
        this.MAX_ATTEMPTS = 3;
        this.attempts = 0;
        this.loadJS();
    }

    onError() {
        if (this.attempts < this.MAX_ATTEMPTS) {
            //console.error(`Exception: The script for "${this.wordAsString}" does not exist after ${this.attempts} attempts.`);
            this.loadJS();
        }
        else {
            //console.error(`Exception: The script for "${this.wordAsString}" does not exist after 3 attempts.`);
        }
    }

    loadJS() {
        this.attempts++;
        var script = document.createElement('script');
        script.src = `speechAudio/json-js/${this.wordAsString}.mp3.LPC.json.js`;

        // when the script is loaded, first call the "loaded" method in this class, then call the "success" function
        script.onload = () => {
            this.loaded(script);
            this.success();
        };
        script.onerror = this.onError;

        document.head.appendChild(script);
    }

    loaded(scriptElement) {
        console.log(`Loaded script for "${this.wordAsString}".`);

        this.jobQueue.workingData = this.jobQueue.workingData || [];
        this.jobQueue.workingData.push(lpcModelData);
        scriptElement.remove();
    }
}
