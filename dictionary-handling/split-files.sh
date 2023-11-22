#!/bin/bash

# Check if enough arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <file-to-split> <number-of-resulting-files> <new-file-base-name>"
    exit 1
fi

# Assigning arguments to variables for clarity
fileToSplit="$1"
numberOfFiles="$2"
newFileBaseName="$3"

# Check if the file to split exists
if [ ! -f "$fileToSplit" ]; then
    echo "File $fileToSplit does not exist."
    exit 1
fi

# Calculate the number of lines per file
totalLines=$(wc -l < "$fileToSplit")
((linesPerFile = (totalLines + numberOfFiles - 1) / numberOfFiles))

# Check if linesPerFile is zero
if [ "$linesPerFile" -eq 0 ]; then
    echo "The number of resulting files is greater than the number of lines in the file."
    exit 1
fi

# Splitting the file
startLine=1
for (( i=1; i<=numberOfFiles; i++ )); do
    endLine=$((startLine + linesPerFile - 1))
    if [ "$i" -eq "$numberOfFiles" ]; then
        endLine=$totalLines
    fi
    sed -n "${startLine},${endLine}p" "$fileToSplit" > "${newFileBaseName}_${i}.txt"
    startLine=$((endLine + 1))
done

echo "Splitting complete."
