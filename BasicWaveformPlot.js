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

    drawZeroLine(min, max) {
        this.ctx.strokeStyle = 'rgb(200, 255, 200)';
        this.ctx.beginPath();
        let y = this.canvas.height - (0 - min) / (max - min) * this.canvas.height;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }

    drawDataBounds(min, max, lowerBound, upperBound) {
        // draw dotted lines at the lower and upper bounds
        this.ctx.strokeStyle = 'rgb(0, 155, 0)';
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 5]);
        let y = this.canvas.height - (lowerBound - min) / (max - min) * this.canvas.height;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        y = this.canvas.height - (upperBound - min) / (max - min) * this.canvas.height;
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }

    drawWaveform(pcmSignalBuffer, min, max) {
        this.ctx.fillStyle = 'rgb(0, 0, 0)';
        for (let i = 0; i < this.canvas.width; ++i) {
            let value = pcmSignalBuffer[Math.floor(i * pcmSignalBuffer.length / this.canvas.width)];
            let y = this.canvas.height - (value - min) / (max - min) * this.canvas.height;
            this.ctx.fillRect(i, y, 1, 1);
        }
    }


    visualize(pcmSignalBuffer, min, max, lowerBound, upperBound) {
        this.drawBackground();
        this.drawZeroLine(min, max);
        this.drawDataBounds(min, max, lowerBound, upperBound);
        this.drawWaveform(pcmSignalBuffer, min, max);
    }
}
