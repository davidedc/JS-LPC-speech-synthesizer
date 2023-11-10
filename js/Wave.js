class Wave {
    constructor(audioBuffer) {
        
        let numOfChan = audioBuffer.numberOfChannels,
            length = audioBuffer.length * numOfChan * 2 + 44,
            channels = [],
            i, sample, offset = 0;
            
        this.pos = 0;
        this.buffer = new ArrayBuffer(length);
        this.view = new DataView(this.buffer);

        // write WAVE header
        this.setUint32(0x46464952); // "RIFF"
        this.setUint32(length - 8); // file length - 8
        this.setUint32(0x45564157); // "WAVE"


        this.setUint32(0x20746d66); // "fmt " chunk
        this.setUint32(16); // length = 16
        this.setUint16(1); // PCM (uncompressed)
        this.setUint16(numOfChan);
        this.setUint32(audioBuffer.sampleRate);
        this.setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        this.setUint16(numOfChan * 2); // block-align
        this.setUint16(16); // 16-bit (hardcoded in this demo)

        this.setUint32(0x61746164); // "data" - chunk
        this.setUint32(length - this.pos - 4); // chunk length


        // write interleaved data
        for (i = 0; i < audioBuffer.numberOfChannels; i++)
            channels.push(audioBuffer.getChannelData(i));

        while (this.pos < length) {

            for (i = 0; i < numOfChan; i++) { // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                this.view.setInt16(this.pos, sample, true); // write 16-bit sample
                this.pos += 2;
            }
            offset++; // next source sample
        }

    }

    static fromBuffer(audioBuffer) {
        return new Wave(audioBuffer);
    }

    toBlob() {
        // create Blob
        return new Blob([this.buffer], { type: "audio/wav" });
    }

    // Helper functions this.setUint16 and this.setUint32 will be methods of the Wave class
    setUint16(data) {
        this.view.setUint16(this.pos, data, true);
        this.pos += 2;
    }

    setUint32(data) {
        this.view.setUint32(this.pos, data, true);
        this.pos += 4;
    }
}
