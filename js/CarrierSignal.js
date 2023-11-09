class CarrierSignal {
    constructor(pitch, sampleRate) {
        this.rosenbergPulse = new RosenbergModelGlottalPulse(pitch, sampleRate);
        this.aspiration = new Aspiration();
    }

    atSample(sampleIndex) {
        const glottalPulse = this.rosenbergPulse.atSample(sampleIndex);
        const aspiration = this.aspiration.atSample(sampleIndex);
        return aspiration + glottalPulse;
    }
}
