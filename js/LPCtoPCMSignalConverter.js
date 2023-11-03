// The "order" of an LPC model == number of coefficients == number of poles ==
// the number of previous samples that are used to predict the current sample in the speech signal.
// The prediction is simply a linear combination of the previous samples!
// To accurately estimate F formants, an LPC model of order at least 2F+2 is recommended.
// The LPC order is also related to the sample rate of the audio file (as of course the
// higher the sample rate, the wider the frequency range in which the formants can be found):
//   8000 Hz - LPC order = ~10 (phone quality, to estimate 4 formants, minimum for intelligible speech)
//   10000 Hz - LPC order = 12-14 (males, to estimate 5 or 6 formants) and 8-10 (females, to estimate 3 or 4 formants)
//   22050 Hz - LPC order = 24-26 (males, to estimate 11 or 12 formants) and 22-24 (females, to estimate 10 or 11 formants)

class LPCtoPCMSignalConverter {
    constructor() {
        // Size of the moving average window for signal smoothing
        this.movingAverageWindowSize = 3;
    }

    build(lpcModelData, pitch, useFloat32 = false, carrierSignalGenerator) {
        let pcmSignalBuffer = [];

        const maxLPCOrder = lpcModelData.maxnCoefficients;
        const pastSamplesBuffer = new Array(maxLPCOrder + 1).fill(0);
        let pastSamplesBufferIndex = 0;
        let sampleIndex = -1;

        let secondsBetweenFrameStarts = lpcModelData.dx;
        const sampleRate = 1 / lpcModelData.samplingPeriod;
        const samplesPerFrame = Math.floor(secondsBetweenFrameStarts * sampleRate);

        let movingAvgWindowBuffer = new Array(this.movingAverageWindowSize).fill(0);
        let movingAvgWindowSum = 0;
        let previousSample = 0;

        // Loop through LPC frames
        for (let lpcFrameIndex = 0; lpcFrameIndex < lpcModelData.frames.length; ++lpcFrameIndex) {
            let order = lpcModelData.frames[lpcFrameIndex].nCoefficients;
            let gainValue = lpcModelData.frames[lpcFrameIndex].gain;
            gainValue = useFloat32 ? float64ToFloat32(gainValue) : gainValue;
            let lpcCoefficients = lpcModelData.frames[lpcFrameIndex].a;

            // Process each sample in the current frame
            for (let currentFrameSampleIndex = 0; currentFrameSampleIndex < samplesPerFrame; ++currentFrameSampleIndex) {
                sampleIndex = (sampleIndex + 1) % (sampleRate / pitch);
                let carrierSignal = carrierSignalGenerator.generate(sampleIndex);

                // Modulate the carrier signal using LPC coefficients
                let modulatedCarrier = carrierSignal;
                for (let lpcCoefficientIndex = 0; lpcCoefficientIndex < order; ++lpcCoefficientIndex) {
                    let lpcCoefficientJ = lpcCoefficients[lpcCoefficientIndex];
                    lpcCoefficientJ = useFloat32 ? float64ToFloat32(lpcCoefficientJ) : lpcCoefficientJ;
                    modulatedCarrier -= lpcCoefficientJ * pastSamplesBuffer[(pastSamplesBufferIndex + maxLPCOrder - lpcCoefficientIndex) % maxLPCOrder];
                }

                pastSamplesBufferIndex = (pastSamplesBufferIndex + 1) % maxLPCOrder;
                pastSamplesBuffer[pastSamplesBufferIndex] = modulatedCarrier;
                let processedSample = modulatedCarrier * Math.sqrt(gainValue);

                // Apply sample-level smoothing and moving average smoothing ///////////////////////////
                //   Sample-level smoothing
                let sampleLevelSmoothed = 0.5 * (previousSample + processedSample);
                previousSample = sampleLevelSmoothed;

                //   Moving average smoothing
                movingAvgWindowSum -= movingAvgWindowBuffer.shift();
                movingAvgWindowBuffer.push(sampleLevelSmoothed);
                movingAvgWindowSum += sampleLevelSmoothed;
                let movingAverageSmoothed = movingAvgWindowSum / this.movingAverageWindowSize;


                pcmSignalBuffer.push(movingAverageSmoothed);
            }
        }
        return pcmSignalBuffer;
    }
}
