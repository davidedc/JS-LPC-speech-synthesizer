#!/bin/bash

# Check if two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_directory> <target_directory>"
    exit 1
fi

# Assign arguments to variables
SOURCE_DIR=$1
TARGET_DIR=$2

# Create the target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Find all .mp3 files and copy them to the target directory
find "$SOURCE_DIR" -type f -name '*.mp3' -exec cp {} "$TARGET_DIR" \;

