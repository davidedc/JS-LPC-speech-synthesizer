function exception(word) {
    console.error(`Exception: The script for "${word}" does not exist after 3 attempts.`);
}


function buildPCMForAllWords(allWordsLPCModels) {
    let jobQueue = new JobQueue(speed);

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

let dropdown = document.getElementById('dropdown');
let textbox = document.getElementById('textbox');
let playButton = document.getElementById('playButton');

const sentences = [
    'one might be able to operate a switch two or three times a second',
    'finding doing seconding being knowing looking noting saying seeing telling thinking wanting willing',
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


textbox.textContent = dropdown.value;
dropdown.addEventListener('change', function() {
    textbox.textContent = textbox.value = dropdown.value;
    }
);

// when the play button is clicked...
playButton.addEventListener('click', function() {

    // get the words from the textbox
    let text = document.getElementById('textbox').value;

    var doc = nlp(text);
    doc.compute('penn');
    let json = doc.json()[0].terms;
    let POSArray = json.map(term=> term.penn );
    console.log(POSArray);


    let words = text.split(' ');
    let jobQueue = new JobQueue();

    // scan the words array with a for loop
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        // pass a flag to the job to indicate if the word a noun and one to indicate if it is a verb
        // note that if the word appears multiple times with different meaning, the last meaning will be used
        let isNoun = false;
        let isVerb = false;
        if (POSArray[i]) {
            isNoun = POSArray[i].includes('NN');
            isVerb = POSArray[i].includes('VB');
        }

        let job = new LoadWordDataJob(word, isNoun, isVerb, i);
        jobQueue.enqueue(job);
    }



    jobQueue.startJobs(buildPCMForAllWords);
});
