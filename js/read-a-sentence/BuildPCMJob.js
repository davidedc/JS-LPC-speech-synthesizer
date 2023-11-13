class BuildPCMJob extends Job {

    constructor(lpModelData) {
        super();
        this.lpModelData = lpModelData.lpcModelData;
        this.wordToBuild = lpModelData.wordAsString;
        this.actualWordLoaded = lpModelData.actualWordLoaded;
        this.isNoun = lpModelData.isNoun;
        this.isVerb = lpModelData.isVerb;
        this.wordNumber = lpModelData.wordNumber;
    }

    execute() {
        
        let pitch = 0;
        
        // if this one is a verb and the next one is not a verb, then increase the pitch
        // we do this so that "multiple verb words" are not too monotonous
        // e.g. "can make" or "have done" "have gone" "can do" "can go" etc. etc.
        if (this.wordNumber == 0){
            pitch = window.pitchFirstWord; // pitch for the first word
        } else if (this.isVerb) {
            pitch = window.pitchVerb; // pitch for a verb
        } else if(this.isNoun) {
            pitch = window.pitchNoun; // pitch for a noun
        } else {
            pitch = window.pitchEverythingElse; // pitch for everything else
        }

        // if this was the penultimate word, descend the pitch a little
        if (this.isPenuiltimateJob()) {
            pitch = window.pitchPenultimate; // pitch for the penultimate word
        }

        // if this was the last word, then end on a lower pitch
        if (this.isLastJob()) {
            pitch = window.pitchLastWord; // pitch for the last word
        }

        console.log("word, verb?, noun?, pitch: ", this.wordToBuild, this.isVerb, this.isNoun, pitch);

        speed = window.speed;

        let sampleRate = 1 / this.lpModelData.samplingPeriod;
        let carrierSignal = new CarrierSignal(pitch, sampleRate);

        this.jobQueue.workingData = this.jobQueue.workingData || [];
        this.jobQueue.workingData.push( // an object made my the signal and by the sample rate
            {
                pcmSignal:  PCMSignal.fromLPCModel(this.lpModelData, pitch, speed, false, carrierSignal).getBuffer(),
                sampleRate: sampleRate,
                wordToBuild: this.wordToBuild,
                actualWordLoaded: this.actualWordLoaded
            }
        );

        this.addSIfSPlural(pitch, speed, carrierSignal);
        this.addIng(pitch, speed, carrierSignal);

        this.success();
    }

    // if we in the case of a plural i.e. actualWordLoaded = wordToBuild + 's'
    // then append to the pcmSignal the samples of the "s"
    addSIfSPlural(pitch, speed, carrierSignal) {
        if (this.wordToBuild === this.actualWordLoaded + 's') {
            let pcmSignal = this.jobQueue.workingData[this.jobQueue.workingData.length - 1].pcmSignal;
            // remove the last samples from the pcmSignal
            var removedSamples = 3000;
            pcmSignal.splice(pcmSignal.length - removedSamples, removedSamples);

            var sSignal = PCMSignal.fromLPCModel(suffixSModelData, pitch, speed, false, carrierSignal).getBuffer();
            // append to the samples of the "s" (from sSignal)
            pcmSignal.push(...sSignal);
        }
    }

    addIng(pitch, speed, carrierSignal) {
        if (this.wordToBuild === this.actualWordLoaded + 'ing') {
            let pcmSignal = this.jobQueue.workingData[this.jobQueue.workingData.length - 1].pcmSignal;
            // remove the last samples from the pcmSignal
            var removedSamples = 3000;
            pcmSignal.splice(pcmSignal.length - removedSamples, removedSamples);

            var ingSignal = PCMSignal.fromLPCModel(suffixIngModelData, pitch, speed, false, carrierSignal).getBuffer();
            // append to the samples of the "ing" (from ingSignal)
            pcmSignal.push(...ingSignal);
        }
    }
}
