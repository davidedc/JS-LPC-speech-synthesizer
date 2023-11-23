class LoadWordDataJob extends Job {

    constructor(wordAsString, isNoun, isVerb, wordNumber) {
        super();
        this.wordAsString = wordAsString.toLowerCase();
        this.actualWordBeingLoaded = wordAsString;
        this.isNoun = isNoun;
        this.isVerb = isVerb;
        this.wordNumber = wordNumber;
    }

    execute() {
        // if the word is in the availableWords array, then load the data for the word
        if (availableWords.includes(this.wordAsString)) {
            this.loadWordData();
            return
        }

        // if the word ends with an 's', then try to load the data for the word without the 's'
        if (this.wordAsString.endsWith('s')) {
            let wordWithoutS = this.wordAsString.slice(0, -1);
            if (availableWords.includes(wordWithoutS)) {
                this.actualWordBeingLoaded = wordWithoutS;
                this.loadWordData();
                return;
            }
        }

        // if the word ends with an 'ing', then try to load the data for the word without the 'ing'
        if (this.wordAsString.endsWith('ing')) {
            let wordWithoutIng = this.wordAsString.slice(0, -3);
            if (availableWords.includes(wordWithoutIng)) {
                this.actualWordBeingLoaded = wordWithoutIng;
                this.loadWordData();
                return;
            }
        }

        console.error(`Exception: no audio data for word "${this.wordAsString}"`);

    }

    loadWordData() {
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
        script.src = `data/words/json-js/${this.actualWordBeingLoaded}.mp3.LPC.json.js`;

        // when the script is loaded, first call the "loaded" method in this class, then call the "success" function
        script.onload = () => {
            this.loaded(script);
            this.success();
        };
        script.onerror = this.onError;

        document.head.appendChild(script);
    }

    loaded(scriptElement) {
        console.log(`Loaded script for "${this.actualWordBeingLoaded}".`);

        this.jobQueue.workingData = this.jobQueue.workingData || [];
        this.jobQueue.workingData.push({lpcModelData, wordAsString: this.wordAsString, actualWordLoaded: this.actualWordBeingLoaded, isNoun: this.isNoun, isVerb: this.isVerb, wordNumber: this.wordNumber});
        scriptElement.remove();
    }
}
