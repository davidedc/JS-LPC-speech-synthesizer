#!/bin/bash

# Check if the file exists
if [ ! -f "words.txt" ]; then
    echo "File words.txt not found!"
    exit 1
fi

# Iterate through each line in the file
while read -r word; do
    # Check if the word is not empty
    if [ ! -z "$word" ]; then
        echo "Processing: $word"
        say -o "words/m4v/${word}.m4v" -v Reed "$word"
    fi
done < "words.txt"

echo "All words processed!"
