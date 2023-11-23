#!/bin/bash

# Check if a directory is provided
if [ -z "$1" ]; then
    echo "Please provide a directory."
    exit 1
fi

# Directory to scan
DIR="$1"

# Function to get the base name without any extensions
basename_without_any_extensions() {
    local full_filename="$1"
    local filename
    filename=$(basename -- "$full_filename")
    echo "${filename%%.*}"
}

# Export the function so it's available in subshells
export -f basename_without_any_extensions

# Recursively find all files and apply the function
find "$DIR" -type f -exec bash -c 'basename_without_any_extensions "$0"' {} \;
