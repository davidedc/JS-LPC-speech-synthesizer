class RosenbergModelGlottalPulseGenerator {
    constructor(pitch, sampleRate) {
        this.pitch = pitch;
        this.sampleRate = sampleRate;
    }

    generate(sampleIndex) {
        const omega = sampleIndex / (this.sampleRate / this.pitch);
        if (sampleIndex < this.sampleRate / (2 * this.pitch)) {
            return 0.5 - 0.5 * Math.cos(Math.PI * omega);
        } else if (sampleIndex < this.sampleRate / this.pitch) {
            return 0.5 * Math.cos(Math.PI * (sampleIndex - this.sampleRate / (2 * this.pitch)) / (this.sampleRate / (2 * this.pitch)));
        }
        return 0;
    }
}
