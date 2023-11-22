wget https://norvig.com/ngrams/count_1w.txt
sh filter-words.sh count_1w.txt > count_1w_only-words.txt
sh split-files.sh count_1w_only-words.txt 20 many_words
sh record-words-multiple-files-in-parallel.sh many_words*
