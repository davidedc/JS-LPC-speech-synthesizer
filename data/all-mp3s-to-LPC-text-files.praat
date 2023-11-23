# Define a procedure with input and output directory parameters
procedure processFiles: .inputDirectory$, .outputDirectory$
    # Construct the file pattern by placing strings next to each other
    filePattern$ = .inputDirectory$ + "/mp3/*.mp3"

    # Create a list of all sound files in the input directory
    Create Strings as file list: "soundFilesList", filePattern$
    soundFilesListID = selected("Strings")
    numberOfFiles = Get number of strings

    # Loop over each file in the directory
    for fileIndex from 1 to numberOfFiles
        # Ensure the list of sound files is selected by its ID
        selectObject: soundFilesListID
        
        # Get the file name from the list
        fileName$ = Get string: fileIndex
        
        # Construct the full path of the sound file
        filePath$ = .inputDirectory$ + "/mp3/" + fileName$

        nonResampledSound = Read from file: filePath$
        nonResampledSoundMono = Convert to mono

        # Convert to 22kHz (assuming the sound file is the selected object)
        resampledSound = Resample: 22050, 50
        
        # Analyse spectrum -> to LPC -> to LPC (Burg) -> Order 26
        lpc = To LPC (burg): 26, 0.025, 0.005, 50

        # Save LPC data to the output directory
        lpcFileName$ = .outputDirectory$ + "/" + fileName$ + ".LPC.txt"
        Save as text file: lpcFileName$
        
        # Clean up objects
        removeObject: lpc, resampledSound, nonResampledSound, nonResampledSoundMono
    endfor

    # Clean up the list of files
    removeObject: soundFilesListID
endproc

inputDirectory$ = "/Volumes/Seagate 5tb/JS-LPC-Project-too-big-for-internal-drive/JS-LPC-speech-synthesizer/data/words"
outputDirectory$ = "/Volumes/Seagate 5tb/JS-LPC-Project-too-big-for-internal-drive/JS-LPC-speech-synthesizer/data/words/lpc"
@processFiles: inputDirectory$, outputDirectory$

inputDirectory$ = "/Volumes/Seagate 5tb/JS-LPC-Project-too-big-for-internal-drive/JS-LPC-speech-synthesizer/data/suffixes"
outputDirectory$ = "/Volumes/Seagate 5tb/JS-LPC-Project-too-big-for-internal-drive/JS-LPC-speech-synthesizer/data/suffixes/lpc"
@processFiles: inputDirectory$, outputDirectory$