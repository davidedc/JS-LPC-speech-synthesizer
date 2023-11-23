for file in words/m4v/*.m4v; do
  filename=$(basename "$file" .m4v)
  ffmpeg -i "$file" -q:a 0 -map a "words/mp3/${filename}.mp3"
done