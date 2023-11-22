const fs = require('fs');
const readline = require('readline');

// Get script parameters
const fileName = process.argv[2];
const maxLetterSize = parseInt(process.argv[3], 10);
const topN = parseInt(process.argv[4], 10);
const topOccurrenceSizes = parseInt(process.argv[5], 10);

if (!fileName || isNaN(maxLetterSize) || isNaN(topN) || isNaN(topOccurrenceSizes)) {
    console.log("Usage: node script.js <filename> <maxLetterSize> <topN> <topOccurrenceSizes>");
    process.exit(1);
}

const letterCounts = {};
for (let i = 1; i <= maxLetterSize; i++) {
    letterCounts[i] = {};
}

function updateLetterCounts(word) {
    for (let size = 1; size <= maxLetterSize; size++) {
        for (let i = 0; i <= word.length - size; i++) {
            const sequence = word.substring(i, i + size);
            letterCounts[size][sequence] = (letterCounts[size][sequence] || 0) + 1;
        }
    }
}

function getSortedOccurrences() {
    const allOccurrences = [];
    for (let size = 1; size <= maxLetterSize; size++) {
        for (const [sequence, count] of Object.entries(letterCounts[size])) {
            allOccurrences.push({
                sequence,
                count,
                sizeOfOccurrences: sequence.length * count
            });
        }
    }

    return allOccurrences.sort((a, b) => b.sizeOfOccurrences - a.sizeOfOccurrences);
}

async function processFile() {
    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const words = line.toLowerCase().split(/\s+/);
        words.forEach(updateLetterCounts);
    }

    const sortedOccurrences = getSortedOccurrences();
    console.log(`Top ${topOccurrenceSizes} occurrences sizes sorted from high to low:`);
    sortedOccurrences.slice(0, topOccurrenceSizes).forEach(occurrence => {
        console.log(`${occurrence.sequence} (Size: ${occurrence.sizeOfOccurrences}, Count: ${occurrence.count})`);
    });
}

processFile().catch(error => {
    console.error('Error processing the file:', error);
});
