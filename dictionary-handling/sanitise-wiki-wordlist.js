const fs = require('fs');
const path = require('path');

// Function to remove non-Latin characters and perform other transformations
function processWord(word) {
    // Remove words with non-Latin characters
    if (word.match(/[^\u0000-\u007F]+/)) {
        return null;
    }

    // Replace Latin accented characters with their unaccented counterparts
    word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Split on dashes
    word = word.split('-').join('\n');

    // Split on underscores, no need to capitalize
    word = word.split('_').join('\n');

    return word;

}

// Function to process the file
function processFile(inputFilePath, outputFilePath) {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        const lines = data.split('\n');
        let processedLines = [];

        lines.forEach(line => {
            // Remove 's
            line = line.replace(/'s/g, "");

            // remove all remaining apostrophes
            line = line.replace(/'/g, "");

            // Process each word
            const processedWord = processWord(line);
            if (processedWord) {
                processedLines.push(processedWord);
            }
        });

        // Write the processed words to a new file
        fs.writeFile(outputFilePath, processedLines.join('\n'), err => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`Processed words written to ${outputFilePath}`);
            }
        });
    });
}

// Specify the input and output file paths
const inputFilePath = path.join(__dirname, 'enwiki-only-words.txt'); // Replace 'input.txt' with your input file name
const outputFilePath = path.join(__dirname, 'enwiki-sanitised.txt');

// Process the file
processFile(inputFilePath, outputFilePath);
