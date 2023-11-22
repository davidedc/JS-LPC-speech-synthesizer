#!/bin/bash

# Function to normalize the directory path
normalize_dir() {
    if [ -d "$1" ]; then
        # If the directory exists, return its absolute path
        local dir_path=$(cd "$1" && pwd -P)
        echo "$dir_path"
    else
        # If the directory doesn't exist, handle the path appropriately
        if [[ "$1" = /* ]]; then
            # Absolute path
            echo "$1"
        else
            # Relative path
            echo "$PWD/${1#./}"
        fi
    fi
}

# Function to add a trailing slash to a directory path if it doesn't have one
add_trailing_slash() {
    [[ "$1" != */ ]] && echo "$1"/ || echo "$1"
}

echo "Script started."

# Check if the correct number of arguments is given
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 source_directory destination_directory"
    exit 1
fi

echo "Normalizing source directory..."
src_dir=$(add_trailing_slash "$(normalize_dir "$1")")
echo "Source directory: $src_dir"

echo "Normalizing destination directory..."
dst_dir=$(add_trailing_slash "$(normalize_dir "$2")")
echo "Destination directory: $dst_dir"

# Check if source directory exists and is readable
if [ ! -d "$src_dir" ] || [ ! -r "$src_dir" ]; then
    echo "Source directory does not exist or is not readable."
    exit 1
fi

# Check if destination directory is writable
if [ ! -d "$dst_dir" ] && ! mkdir -p "$dst_dir"; then
    echo "Destination directory cannot be created or is not writable."
    exit 1
fi

echo "Starting to find .m4v files..."

# Find all .m4v files in the source directory and its subdirectories
find "$src_dir" -type f -name '*.m4v' | while read file; do

  # append a starting slash to the file path
  echo "Processing file: $file"

  # if the file doesn't start with a slash, add one
  if [[ "$file" != /* ]]; then
    file="/$file"
  fi

  # Derive the relative path from the full path
  relative_path="${file#$src_dir}"

  # Remove the starting slash
  relative_path="${relative_path#/}"

  echo "Relative path: $relative_path"

  # Replace .m4v with .mp3 in the relative path
  relative_path_no_ext="${relative_path%.m4v}.mp3"
  echo "Relative path (no ext): $relative_path_no_ext"

  # Create the destination path
  destination_path="$dst_dir$relative_path_no_ext"
  echo "Destination path: $destination_path"

  # Create destination directory if it doesn't exist
  mkdir -p "$(dirname "$destination_path")"
  echo "Directory created (if it didn't exist): $(dirname "$destination_path")"

  # if the destination file already exists, skip it
  if [ -f "$destination_path" ]; then
    echo "Destination file already exists. Skipping..."
    continue
  fi

  # Convert the file
  echo "Converting file..."
  ffmpeg -i "$file" -q:a 0 -map a "$destination_path"
  echo "Conversion complete."
done

echo "Script completed."
