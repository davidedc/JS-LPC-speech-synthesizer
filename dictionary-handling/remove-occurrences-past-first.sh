#!/bin/bash

# Check if a file name is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

# Filename
file=$1

# Use awk to process the file
awk '
{
    for (i=1; i<=NF; i++) {
        if (!seen[$i]++) {
            printf "%s ", $i
        }
    }
    printf "\n"
}
' "$file"
