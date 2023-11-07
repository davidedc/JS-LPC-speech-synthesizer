#!/bin/bash

# Start of the JS file with the array declaration
echo "availableWords=[" > available-words.js

# Read from words.txt and append to the array in available-words.js
while IFS= read -r line; do
    # Append each line as a quoted string to the array, followed by a comma
    echo "\"$line\"," >> available-words.js
done < words.txt

# Use sed to remove the last comma from the file and close the array
sed -i '' -e '$ s/,$/];/' available-words.js

# If you're using GNU sed (common in Linux), you might need to use:
# sed -i '$ s/,$/];/' available-words.js

echo "The JavaScript file available-words.js has been generated."
