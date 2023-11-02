class BasicWaveformPlot {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        this.canvas.width = 1600;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext('2d');
    }

    attachToDocument() {
        document.body.appendChild(this.canvas);
    }

    drawBackground() {
        this.ctx.fillStyle = 'rgb(240, 240, 240)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawWaveform(pcmSignalBuffer, min, max) {
        this.ctx.fillStyle = 'rgb(0, 0, 0)';
        for (let i = 0; i < this.canvas.width; ++i) {
            let value = pcmSignalBuffer[Math.floor(i * pcmSignalBuffer.length / this.canvas.width)];
            let y = this.canvas.height - (value - min) / (max - min) * this.canvas.height;
            this.ctx.fillRect(i, y, 1, 1);
        }
    }

    visualize(pcmSignalBuffer, min, max) {
        this.drawBackground();
        this.drawWaveform(pcmSignalBuffer, min, max);
    }
}
