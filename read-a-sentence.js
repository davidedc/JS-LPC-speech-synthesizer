var allWordsLPCModels = [];

class Job {
    constructor(data) {
        this.data = data;
    }

    execute(onSuccess, onError) {
        throw new Error("Execute method should be implemented by subclasses.");
    }
}

class LoadWordDataJob extends Job {
    execute(onSuccess, onError) {
        var script = document.createElement('script');
        script.src = `speechAudio/json-js/${this.data}.mp3.LPC.json.js`;

        // when the script is loaded, first call the "loaded" method in this class, then call the "onSuccess" function
        script.onload = () => {
            this.loaded();
            onSuccess();
        };
        script.onerror = onError;

        document.head.appendChild(script);
    }

    loaded() {
        console.log(`Loaded script for "${this.data}".`);
        allWordsLPCModels.push(lpcModelData);
    }
}

class JobQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(job) {
        this.queue.push(job);
    }

    dequeue() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

function exception(word) {
    console.error(`Exception: The script for "${word}" does not exist after 3 attempts.`);
}

function done() {
    console.log("All scripts loaded or exceptions handled.");
    buildPCMForAllWords();
}

function buildPCMForAllWords() {
    let jobQueue = new JobQueue();

    allWordsLPCModels.forEach(lpcModelData => {
        let job = new BuildPCMJob(lpcModelData);
        jobQueue.enqueue(job);
    });

    processJobs(jobQueue, playPCMForAllWords);
}

var pcmSignalBuffers = [];

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

function playPCMForAllWords() {
    playPCMOfNextWord();
}

// play all the pcmSignalBuffers in sequence
function playPCMOfNextWord() {
    let numberOfFadeInSamples = 50;
    let numberOfFadeoutSamples = 50;
    let audioContext = new AudioContext();
    let bufferLength = pcmSignalBuffers[0].length;

    let buffer = audioContext.createBuffer(1, bufferLength, 1 / allWordsLPCModels[0].samplingPeriod);
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

        channelData[i] = pcmSignalBuffers[0][i] * gain;
    }


    let source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();

    source.onended = () => {
        pcmSignalBuffers.shift();
        allWordsLPCModels.shift();
        if (pcmSignalBuffers.length > 0) {
            playPCMOfNextWord();
        }
    }
}


function processJobs(jobQueue, done) {
    const MAX_ATTEMPTS = 3;
    let attempts = {};

    function processNext() {
        if (jobQueue.isEmpty()) {
            done();
            return;
        }

        let job = jobQueue.dequeue();
        let word = job.data;
        attempts[word] = (attempts[word] || 0) + 1;

        job.execute(
            () => {
                processNext();
            },
            () => {
                if (attempts[word] < MAX_ATTEMPTS) {
                    console.log(`Retrying to load script for "${word}". Attempt ${attempts[word]}`);
                    jobQueue.enqueue(job); // Re-add the job to the queue
                    processNext();
                } else {
                    exception(word);
                    processNext();
                }
            }
        );
    }

    processNext();
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
    'Can you find the man'
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

    processJobs(jobQueue, done);
});
