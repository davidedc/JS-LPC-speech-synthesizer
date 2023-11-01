# Define the directory containing the sound files
directory$ = "/Users/davidedellacasa/Desktop/mysw/JS-LPC-speech-synthesizer/speechAudio"

# Create a list of all sound files in the directory
Create Strings as file list: "soundFilesList", directory$ + "/mp3/*.mp3"

# Get the object ID of the Strings object
soundFilesListID = selected("Strings")

# Get the number of files in the list
numberOfFiles = Get number of strings

# writeInfoLine: "The content of the variable is: ", numberOfFiles

# Loop over each file in the directory
for fileIndex from 1 to numberOfFiles
    # Ensure the list of sound files is selected by its ID
    selectObject: soundFilesListID

    # Get the file name from the list
    fileName$ = Get string: fileIndex
    # writeInfoLine: "The content of the variable is: ", fileName$

    # Construct the full path of the sound file
    filePath$ = directory$ + "/mp3/" + fileName$

    # Read the sound file
    nonResampledSound = Read from file: filePath$

    # Convert to 22kHz (assuming the sound file is the selected object)
    nonResampledSoundMono = Convert to mono
    resampledSound = Resample: 22050, 50

    # Analyse spectrum -> to LPC -> to LPC (Burg) -> Order 26
    lpc = To LPC (burg): 26, 0.025, 0.005, 50

    # Save LPC data as text
    lpcFileName$ = directory$ + "/lpc/" + fileName$ + ".LPC.txt"
    Save as text file: lpcFileName$

    # Clean up objects
    removeObject: lpc, resampledSound, nonResampledSound, nonResampledSoundMono
endfor

# Clean up the list of files
removeObject: soundFilesListID
