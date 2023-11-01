for file in m4v/*.m4v; do
  filename=$(basename "$file" .m4v)
  ffmpeg -i "$file" -q:a 0 -map a "mp3/${filename}.mp3"
done