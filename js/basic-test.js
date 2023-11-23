// create another button to play the audio
let playButton = document.createElement('button');
playButton.id = 'playButton';
playButton.innerText = 'Play';


// remove the play button from the document IF THERE IS ONE
if (document.getElementById('playButton')) {
    document.body.removeChild(playButton);
}

removeAllCanvasesFromDocument();
removeDownloadLinkFromDocument();

let pitch = 150;
let speed = 1;
let sampleRate = 1 / lpcModelData.samplingPeriod;;
let carrierSignal = new CarrierSignal(pitch, sampleRate);
let pcmSignalBuffer = PCMSignal.fromLPCModel(lpcModelData, pitch, speed, false, carrierSignal).getBuffer();

document.body.appendChild(playButton);

// Handle playing the audio
playButton.addEventListener('click', function() { // Assuming a button with this id exists
    
    // print out the minimum and maximum values of the pcmSignalBuffer
    let { min, max } = findBufferMinMax(pcmSignalBuffer);
    console.log("min: " + min);
    console.log("max: " + max);

    removeAllCanvasesFromDocument(); 
    removeDownloadLinkFromDocument();

    // add a canvas that shows equi-spaced values of the pcmSignalBuffer values
    const waveformPlot = new BasicWaveformPlot();
    waveformPlot.attachToDocument();
    waveformPlot.visualize(pcmSignalBuffer, -1, 1, min, max);

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

    createLinkToPlayWavFileBlobViaAudioTag(buffer);

});

function removeDownloadLinkFromDocument() {
    let downloadLink = document.getElementById('downloadLink');
    if (downloadLink) {
        document.body.removeChild(downloadLink);
    }
}

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
    return { min, max };
}

function createLinkToDownloadPCMBufferAsWavFile(buffer) {
    let waveBlob = Wave.fromBuffer(buffer).toBlob();
    let waveBlobUrl = window.URL.createObjectURL(waveBlob);
    let waveBlobLink = document.createElement('a');
    // give the link an id so we can remove it from the document if we need to
    waveBlobLink.id = 'downloadLink';
    waveBlobLink.href = waveBlobUrl;
    waveBlobLink.download = 'audio.wav';
    waveBlobLink.innerHTML = 'download';
    document.body.appendChild(waveBlobLink);
}

function createLinkToPlayWavFileBlobViaAudioTag(buffer) {
    let playWaveLink = document.createElement('a');

    // give the link an id so we can remove it from the document if we need to
    playWaveLink.id = 'playViaAudioElementLink';
    playWaveLink.href = '#';
    playWaveLink.innerHTML = 'play via audio element';
    document.body.appendChild(playWaveLink);

    // when user clicks on link, call playViaAudioElement function
    playWaveLink.addEventListener('click', function() {
        playViaAudioElement(buffer);
    });
}

function playViaAudioElement(buffer) {
    let waveBlob = Wave.fromBuffer(buffer).toBlob();
    let waveBlobUrl = window.URL.createObjectURL(waveBlob);
    let audioElement = document.createElement('audio');
    audioElement.src = waveBlobUrl;
    audioElement.play();

    // remove the audio element from the document after the audio has finished playing
    audioElement.addEventListener('ended', function() {
        document.body.removeChild(audioElement);
    });

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
