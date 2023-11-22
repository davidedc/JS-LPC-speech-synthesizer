const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Function to copy the file if it doesn't exist in the destination
function copyIfNotExists(sourcePath, destPath) {
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(sourcePath, destPath);
    }
}

async function processFile(fileName, skip, limit, sourceDir, destDir) {
    try {
        const fileStream = fs.createReadStream(fileName);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let skipped = 0;
        let processed = 0;
        let totalProcessed = 0;

        for await (const word of rl) {
            // Skip the first 'skip' words
            if (skipped < skip) {
                skipped++;
                continue;
            }

            // Stop processing after 'limit' words
            if (totalProcessed >= limit) break;

            // Construct the source and destination paths
            const subDirs = word.slice(0, 3).split('');
            const filePath = path.join(...subDirs, `${word}.mp3`);
            const sourcePath = path.join(sourceDir, filePath);
            const destPath = path.join(destDir, filePath);

            // Copy the file if it exists in the source and not in the destination
            if (fs.existsSync(sourcePath)) {
                copyIfNotExists(sourcePath, destPath);
            }

            processed++;
            totalProcessed++;

            // Print out the number of processed words every 100 words
            if (processed >= 100) {
                console.log(`${totalProcessed} words processed.`);
                processed = 0;
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 5) {
    console.log('Usage: node script.js <file name> <skip> <limit> <source directory> <destination directory>');
    process.exit(1);
}

const [fileName, skip, limit, sourceDir, destDir] = args;
processFile(fileName, parseInt(skip), parseInt(limit), sourceDir, destDir);
