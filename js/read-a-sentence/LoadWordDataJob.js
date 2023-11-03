class LoadWordDataJob extends Job {
    execute(onSuccess, onError) {
        var script = document.createElement('script');
        script.src = `speechAudio/json-js/${this.data}.mp3.LPC.json.js`;

        // when the script is loaded, first call the "loaded" method in this class, then call the "onSuccess" function
        script.onload = () => {
            this.loaded();
            onSuccess();
        };
        script.onerror = onError;

        document.head.appendChild(script);
    }

    loaded() {
        console.log(`Loaded script for "${this.data}".`);
        allWordsLPCModels.push(lpcModelData);
    }
}
