# for file in ; do node extractLPCData.js "$file" "words/json-js/$file.json.js"; done

for file in words/lpc/*.txt; do
  filename=$(basename "$file" .txt)
  # ffmpeg -i "$file" -q:a 0 -map a "mp3/${filename}.mp3"
  node extractLPCData.js "$file" "words/json-js/${filename}.json.js" --trimSilence --trimQuiet
done


for file in suffixes/lpc/*.txt; do
  filename=$(basename "$file" .txt)
  # ffmpeg -i "$file" -q:a 0 -map a "mp3/${filename}.mp3"
  node extractLPCData.js "$file" "suffixes/json-js/${filename}.json.js" --trimSilence --trimQuiet
done