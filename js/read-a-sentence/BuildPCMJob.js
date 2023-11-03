class BuildPCMJob extends Job {
    execute(onSuccess, onError) {
        let pitch = 150;
        let sampleRate = 1 / this.data.samplingPeriod;
        let carrierSignalGenerator = new CarrierSignalGenerator(pitch, sampleRate);
        let pcmSignalBuilder = new LPCtoPCMSignalConverter();
        pcmSignalBuffers.push(pcmSignalBuilder.build(this.data, pitch, false, carrierSignalGenerator));
        onSuccess();
    }
}
