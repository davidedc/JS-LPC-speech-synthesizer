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
            pitch = 150;
        } else if (this.isVerb) {
            pitch = 160;
        } else if(this.isNoun) {
            pitch = 160;
        } else {
            pitch = 150;
        }

        // if this was the penultimate word, descend the pitch a little
        if (this.isPenuiltimateJob()) {
            pitch = 140;
        }

        // if this was the last word, then end on a lower pitch
        if (this.isLastJob()) {
            pitch = 125;
        }

        console.log("word, verb?, noun?, pitch: ", this.wordToBuild, this.isVerb, this.isNoun, pitch);

        let sampleRate = 1 / this.lpModelData.samplingPeriod;
        let carrierSignalGenerator = new CarrierSignalGenerator(pitch, sampleRate);
        let pcmSignalBuilder = new LPCtoPCMSignalConverter();

        this.jobQueue.workingData = this.jobQueue.workingData || [];
        this.jobQueue.workingData.push( // an object made my the signal and by the sample rate
            {
                pcmSignal:  pcmSignalBuilder.build(this.lpModelData, pitch, false, carrierSignalGenerator),
                sampleRate: sampleRate,
                wordToBuild: this.wordToBuild,
                actualWordLoaded: this.actualWordLoaded
            }
        );

        this.addSIfSPlural();

        this.success();
    }

    // if we in the case of a plural i.e. actualWordLoaded = wordToBuild + 's'
    // then append to the pcmSignal the samples of the "s"
    addSIfSPlural() {
        if (this.wordToBuild === this.actualWordLoaded + 's') {
            let pcmSignal = this.jobQueue.workingData[this.jobQueue.workingData.length - 1].pcmSignal;
            // remove the last samples from the pcmSignal
            var removedSamples = 3000;
            pcmSignal.splice(pcmSignal.length - removedSamples, removedSamples);
            // append to the samples of the "s" (from sSignal)
            pcmSignal.push(...sSignal);
        }
    }
}
