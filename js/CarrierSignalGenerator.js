class CarrierSignalGenerator {
    constructor(pitch, sampleRate) {
        this.rosenbergPulseGenerator = new RosenbergModelGlottalPulseGenerator(pitch, sampleRate);
        this.aspirationGenerator = new AspirationGenerator();
    }

    generate(sampleIndex) {
        const glottalPulse = this.rosenbergPulseGenerator.generate(sampleIndex);
        const aspiration = this.aspirationGenerator.generate();
        return aspiration + glottalPulse;
    }
}
