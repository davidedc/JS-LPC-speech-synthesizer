# for file in ; do node extractLPCData.js "$file" "json-js/$file.json.js"; done

for file in lpc/*.txt; do
  filename=$(basename "$file" .txt)
  # ffmpeg -i "$file" -q:a 0 -map a "mp3/${filename}.mp3"
  node extractLPCData.js "$file" "json-js/${filename}.json.js" --trimSilence --trimQuiet
done


for file in sound-chunks/suffixes/lpc/*.txt; do
  filename=$(basename "$file" .txt)
  # ffmpeg -i "$file" -q:a 0 -map a "mp3/${filename}.mp3"
  node extractLPCData.js "$file" "sound-chunks/suffixes/json-js/${filename}.json.js" --trimSilence --trimQuiet
done