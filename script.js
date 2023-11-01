// create another button to play the audio
let playButton = document.createElement('button');
playButton.id = 'playButton';
playButton.innerText = 'Play';


// remove the play button from the document IF THERE IS ONE
if (document.getElementById('playButton')) {
    document.body.removeChild(playButton);
}

removeAllCanvasesFromDocument();

let pitch = 150;
let sampleRate = 1 / lpcModelData.samplingPeriod;;
let carrierSignalGenerator = new CarrierSignalGenerator(pitch, sampleRate);
let pcmSignalBuilder = new LPCtoPCMSignalConverter();
let pcmSignalBuffer = pcmSignalBuilder.build(lpcModelData, pitch, false, carrierSignalGenerator);

document.body.appendChild(playButton);

// Handle playing the audio
playButton.addEventListener('click', function() { // Assuming a button with this id exists
    
    // print out the minimum and maximum values of the pcmSignalBuffer
    let { min, max } = findBufferMinMax(pcmSignalBuffer);

    removeAllCanvasesFromDocument(); 
    
    // add a canvas that shows equi-spaced values of the pcmSignalBuffer values
    visualiseAudioBuffer(min, max);

    // play the pcmSignalBuffer
    let audioContext = new AudioContext();
    let buffer = audioContext.createBuffer(1, pcmSignalBuffer.length, sampleRate);
    let channelData = buffer.getChannelData(0);
    for (let i = 0; i < pcmSignalBuffer.length; ++i) {
        channelData[i] = pcmSignalBuffer[i];
    }
    let source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();

    // download the pcmSignalBuffer as a wav file
    createLinkToDownloadPCMBufferAsWavFile(buffer);

});

//////////////////////////////////////////////////////////////////////////////////////////
// Auxiliary functions
//////////////////////////////////////////////////////////////////////////////////////////

function findBufferMinMax(pcmSignalBuffer) {
    let min = 0;
    let max = 0;
    for (let i = 0; i < pcmSignalBuffer.length; ++i) {
        if (pcmSignalBuffer[i] < min) {
            min = pcmSignalBuffer[i];
        }
        if (pcmSignalBuffer[i] > max) {
            max = pcmSignalBuffer[i];
        }
    }
    console.log("min: " + min);
    console.log("max: " + max);
    return { min, max };
}

function createLinkToDownloadPCMBufferAsWavFile(buffer) {
    let wavBlob = audioBufferToWavBlob(buffer);
    let wavBlobUrl = window.URL.createObjectURL(wavBlob);
    let wavBlobLink = document.createElement('a');
    wavBlobLink.href = wavBlobUrl;
    wavBlobLink.download = 'audio.wav';
    wavBlobLink.innerHTML = 'download';
    document.body.appendChild(wavBlobLink);
}

function removeAllCanvasesFromDocument() {
  let canvases = document.getElementsByTagName('canvas');
  for (let i = 0; i < canvases.length; ++i) {
    document.body.removeChild(canvases[i]);
  }
}


// a function that turns a Float64 (Number) value into a Float32 value
function float64ToFloat32(float64) {
    let float32 = new Float32Array(1);
    float32[0] = float64;
    return float32[0];
}
