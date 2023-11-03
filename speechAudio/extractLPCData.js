// Parses "LPC1" object text extract from Praat and converts it to a .js
// file that puts the data into a global variable called LPCData.

const fs = require('fs');
const path = require('path');

function parseLPCData(text, trimSilence, trimQuiet) {
    const lines = text.split('\n');
    let data = {};
    let currentFrame = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('xmin =')) {
            data.xmin = parseFloat(trimmedLine.split('=')[1].trim());
        } else if (trimmedLine.startsWith('xmax =')) {
            data.xmax = parseFloat(trimmedLine.split('=')[1].trim());
        } else if (trimmedLine.startsWith('nx =')) {
            data.nx = parseInt(trimmedLine.split('=')[1].trim(), 10);
        } else if (trimmedLine.startsWith('dx =')) {
            data.dx = parseFloat(trimmedLine.split('=')[1].trim());
        } else if (trimmedLine.startsWith('x1 =')) {
            data.x1 = parseFloat(trimmedLine.split('=')[1].trim());
        } else if (trimmedLine.startsWith('samplingPeriod =')) {
            data.samplingPeriod = parseFloat(trimmedLine.split('=')[1].trim());
        } else if (trimmedLine.startsWith('maxnCoefficients =')) {
            data.maxnCoefficients = parseInt(trimmedLine.split('=')[1].trim(), 10);
        } else if (trimmedLine.startsWith('frames [')) {

            // initialise frames array if it doesn't exist
            if (!data.frames) {
                data.frames = [];
            }

            // beginning of a new frame
            //     frames [n]:
            // initialise empty frame object
            if (trimmedLine.endsWith(':')) {
                currentFrame = { a: [] };
                currentFrame.nCoefficients = 0;
                currentFrame.gain = 0;
                data.frames.push(currentFrame);
            }
        } else if (trimmedLine.startsWith('nCoefficients =')) {
            currentFrame.nCoefficients = parseInt(trimmedLine.split('=')[1].trim(), 10);
        } else if (trimmedLine.startsWith('a [')) {
            const parts = trimmedLine.split('=');
            if (parts.length === 2) {
                const value = parseFloat(parts[1].trim());
                currentFrame.a.push(value);
            }
        } else if (trimmedLine.startsWith('gain =')) {
            currentFrame.gain = parseFloat(trimmedLine.split('=')[1].trim());
        }
    }

    if (trimSilence) {
        data = trimSilentFrames(data);
    }

    if (trimQuiet) {
        data = trimQuietFrames(data);
    }

    return data;
}

function trimSilentFrames(data) {
    let startIndex = 0;
    let endIndex = data.frames.length;

    // Find the first non-empty frame index
    while (startIndex < data.frames.length && data.frames[startIndex].a.length === 0) {
        startIndex++;
    }

    // Find the last non-empty frame index
    while (endIndex > 0 && data.frames[endIndex - 1].a.length === 0) {
        endIndex--;
    }

    // print out the count of the dropped frames
    if (startIndex > 0 || endIndex < data.frames.length) {
        console.log(`SILENT - Trimmed ${startIndex} frames from the beginning and ${data.frames.length - endIndex} frames from the end.`);
    }
    
    // If there are empty frames at the beginning or the end, trim them
    if (startIndex > 0 || endIndex < data.frames.length) {
        data.frames = data.frames.slice(startIndex, endIndex);
    }

    
    return data;
}

function trimQuietFrames(data) {
    let startIndex = 0;
    let endIndex = data.frames.length;

    // Find the first non-empty frame index
    while (startIndex < data.frames.length && data.frames[startIndex].gain < 1e-6) {
        startIndex++;
    }

    // Find the last non-empty frame index
    while (endIndex > 0 && data.frames[endIndex - 1].gain < 1e-10) {
        endIndex--;
    }

    // print out the count of the dropped frames
    if (startIndex > 0 || endIndex < data.frames.length) {
        console.log(`QUIET - Trimmed ${startIndex} frames from the beginning and ${data.frames.length - endIndex} frames from the end.`);
    }
    
    // If there are empty frames at the beginning or the end, trim them
    if (startIndex > 0 || endIndex < data.frames.length) {
        data.frames = data.frames.slice(startIndex, endIndex);
    }

    return data;
}


function processData(inputFilePath, outputFilePath) {
    fs.readFile(inputFilePath, 'utf8', (err, text) => {
        if (err) {
            console.error('Error reading the input file:', err);
            return;
        }

        const lpcModelData = parseLPCData(text, trimSilence, trimQuiet);

        const jsContent = `lpcModelData = ${JSON.stringify(lpcModelData, null, 2)};`;

        fs.writeFile(outputFilePath, jsContent, (err) => {
            if (err) {
                console.error('Error writing the output file:', err);
                return;
            }

            console.log(`Successfully written LPC data to ${outputFilePath}`);
        });
    });
}

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];
let trimSilence = false;
let trimQuiet = false;

// Check if the --trimSilence argument is present
process.argv.forEach(arg => {
    if (arg === '--trimSilence') {
        trimSilence = true;
    }
    if (arg === '--trimQuiet') {
        trimQuiet = true;
    }
});

if (!inputFilePath || !outputFilePath) {
    console.error('Please specify both input and output file paths.');
} else {
    processData(inputFilePath, outputFilePath, trimSilence, trimQuiet);
}