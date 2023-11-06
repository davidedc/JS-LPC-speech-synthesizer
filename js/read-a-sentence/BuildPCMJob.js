class BuildPCMJob extends Job {

    constructor(lpModelData) {
        super();
        this.lpModelData = lpModelData;
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
                sampleRate: sampleRate
            }

        );

        this.success();
    }
}
