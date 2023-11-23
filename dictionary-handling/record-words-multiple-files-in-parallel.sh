#!/bin/bash

# Function to process a single file
process_file() {
    local file=$1
    local count=0
    local total=$(wc -l < "$file")

    echo "Processing file: $file"

    # Iterate through each line in the file
    while read -r word; do
        # Check if the word is not empty and sanitize it for filename
        if [ ! -z "$word" ]; then
            # Remove or replace invalid filename characters
            local safe_word=$(echo "$word" | tr -d '[:punct:]' | tr '[:upper:]' '[:lower:]')

            # Create directory structure based on the first three letters of the word
            local dir_path="words/m4v"
            for (( i=0; i<${#safe_word} && i<3; i++ )); do
                dir_path+="/${safe_word:$i:1}"
            done
            mkdir -p "$dir_path"

            local output_file="${dir_path}/${safe_word}.m4v"

            # Check if the output file already exists
            if [ -f "$output_file" ]; then
                echo "[$file] Skipping: $word (Output file already exists)"
                continue
            fi

            echo "[$file] Processing: $word"
            say -o "$output_file" -v Reed "$word"
            ((count++))
        fi

        # Print progress every 10 words
        if ((count % 10 == 0)); then
            echo "[$file] Progress: $count/$total words processed."
        fi
    done < "$file"

    echo "[$file] All words processed!"
}

# Cleanup function to terminate all child processes
cleanup() {
    echo "Interrupt received. Stopping all processes."
    pkill -P $$
    exit 1
}

# Trap SIGINT (CTRL-C)
trap 'cleanup' SIGINT

# Check if at least one file is provided
if [ $# -eq 0 ]; then
    echo "No files provided!"
    exit 1
fi

# Process each file in parallel
for file in "$@"; do
    if [ ! -f "$file" ]; then
        echo "File $file not found!"
        continue
    fi
    process_file "$file" &
done

# Wait for all background processes to complete
wait
echo "All files processed!"
