function exception(word) {
    console.error(`Exception: The script for "${word}" does not exist after 3 attempts.`);
}


function buildPCMForAllWords(allWordsLPCModels) {
    let jobQueue = new JobQueue();

    allWordsLPCModels.forEach(lpcModelData => {
        let job = new BuildPCMJob(lpcModelData);
        jobQueue.enqueue(job);
    });

    jobQueue.startJobs(playPCMForAllWords);

}

function playPCMForAllWords(pcmSignalBuffersAndSampleRates) {
    playPCMOfNextWord(pcmSignalBuffersAndSampleRates);
}

// play all the pcmSignalBuffersAndSampleRates in sequence
function playPCMOfNextWord(pcmSignalBuffersAndSampleRates) {
    let numberOfFadeInSamples = 50;
    let numberOfFadeoutSamples = 50;
    let audioContext = new AudioContext();
    let firstSignalBufferAndSampleRate = pcmSignalBuffersAndSampleRates[0];
    let bufferLength = firstSignalBufferAndSampleRate.pcmSignal.length;

    let buffer = audioContext.createBuffer(1, bufferLength, firstSignalBufferAndSampleRate.sampleRate);
    let channelData = buffer.getChannelData(0);

    // add the samples, but multiply the first numberOfFadeInSamples by a linear ramp from 0 to 1
    // and the last numberOfFadeoutSamples by a linear ramp from 1 to 0
    for (let i = 0; i < bufferLength; ++i) {
        let gain = 1;
        if (i < numberOfFadeInSamples) {
            gain = i / numberOfFadeInSamples;
        } else if (i > bufferLength - numberOfFadeoutSamples) {
            // making sure that the last sample is 0
            gain = (bufferLength - i - 1) / numberOfFadeoutSamples;
        }

        channelData[i] = firstSignalBufferAndSampleRate.pcmSignal[i] * gain;
    }


    let source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();

    source.onended = () => {
        pcmSignalBuffersAndSampleRates.shift();
        if (pcmSignalBuffersAndSampleRates.length > 0) {
            playPCMOfNextWord(pcmSignalBuffersAndSampleRates);
        }
    }
}


// add a dropdown with some sentences.
let dropdown = document.createElement('select');
dropdown.id = 'dropdown';
document.body.appendChild(dropdown);

const sentences = [
    'one day',
    'They can make a new day for all people',
    'People say that only time will tell if he can make a new way for them',
    'He can also find time to be with her on a day',
    'We can all make one day new by our way',
    'We can all make time for more',
    'We can make a new day by the way we see and think about people',
    'Have time to think',
    'People can make more time for their day',
    'Can you find the man',
    'days finds gives hers'
];

sentences.forEach((sentence) => {
    let option = document.createElement('option');
    option.value = option.textContent = sentence;
    dropdown.appendChild(option);
});
dropdown.addEventListener('change', function() {
        textbox.textContent = dropdown.value;
    }
);


// add a textbox and a play button to the document
let textbox = document.createElement('textarea');
textbox.id = 'textbox';
// pre-populate the textbox with the sentence selected in the dropdown
textbox.textContent = dropdown.value;
document.body.appendChild(textbox);

let playButton = document.createElement('button');
playButton.id = 'playButton';
playButton.textContent = 'Read';
document.body.appendChild(playButton);

// when the play button is clicked...

playButton.addEventListener('click', function() {

    // get the words from the textbox
    let text = document.getElementById('textbox').value;
    let words = text.split(' ');
    let jobQueue = new JobQueue();

    words.forEach(word => {
        let job = new LoadWordDataJob(word);
        jobQueue.enqueue(job);
    });

    jobQueue.startJobs(buildPCMForAllWords);
});
