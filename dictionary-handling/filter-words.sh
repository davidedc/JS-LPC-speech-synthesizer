#!/bin/bash

# Check if a filename is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <filename>"
    echo " or, more typically, "
    echo "Usage: $0 <filename> > newfile.txt"

    exit 1
fi

# Filename from the argument
filename=$1

# Process the file
while IFS=$'\t' read -r word freq
do
    echo "$word"
done < "$filename"
