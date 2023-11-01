function visualiseAudioBuffer(min, max) {
    let canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = 1600;
    canvas.height = 300;
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    // make the background light gray
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    for (let i = 0; i < canvas.width; ++i) {
        // remember to pick them equally spaced
        let value = pcmSignalBuffer[Math.floor(i * pcmSignalBuffer.length / canvas.width)];
        // the values are between min and max
        let y = canvas.height - (value - min) / (max - min) * canvas.height;
        ctx.fillRect(i, y, 1, 1);
    }
}
