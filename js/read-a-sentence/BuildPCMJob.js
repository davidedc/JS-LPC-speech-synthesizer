class BuildPCMJob extends Job {

    constructor(lpModelData) {
        super();
        this.lpModelData = lpModelData.lpcModelData;
        this.wordToBuild = lpModelData.wordAsString;
        this.actualWordLoaded = lpModelData.actualWordLoaded;
    }

    execute() {
        let pitch = 150;
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
