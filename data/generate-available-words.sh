#!/bin/bash

# Start of the JS file with the array declaration
echo "availableWords=[" > words-list.js

# Read from words.txt and append to the array in words-list.js
while IFS= read -r line; do
    # Append each line as a quoted string to the array, followed by a comma
    echo "\"$line\"," >> words-list.js
done < words.txt

# Use sed to remove the last comma from the file and close the array
sed -i '' -e '$ s/,$/];/' words-list.js

# If you're using GNU sed (common in Linux), you might need to use:
# sed -i '$ s/,$/];/' words-list.js

echo "The JavaScript file words-list.js has been generated."
