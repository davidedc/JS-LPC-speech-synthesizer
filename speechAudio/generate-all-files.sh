sh generate-available-words.sh
sh record-words.sh
sh convert-m4vs-to-mp3s.sh
/Applications/Praat.app/Contents/MacOS/Praat --run all-mp3s-to-LPC-text-files.praat
sh convert-lpc-text-to-json-js.sh
