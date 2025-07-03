/**
 * Oscilloscope.js - Real-time audio waveform visualization
 * Displays real-time audio output waveform like the original Collidoscope
 */

export class Oscilloscope {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Visual properties
        this.lineColor = '#00ff88';
        this.backgroundColor = '#000000';
        this.gridColor = 'rgba(0, 255, 136, 0.2)';
        this.lineWidth = 2;
        
        // Data
        this.dataArray = null;
        this.numPoints = 512;
        
        this.initializeCanvas();
    }

    initializeCanvas() {
        this.updateCanvasSize();
        this.clear();
        this.drawGrid();
    }

    updateCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    clear() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
    }

    drawGrid() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        
        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 8; i++) {
            const x = (width / 8) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }

    draw(dataArray) {
        if (!dataArray || dataArray.length === 0) return;
        
        this.dataArray = dataArray;
        this.clear();
        this.drawGrid();
        this.drawWaveform();
    }

    drawWaveform() {
        if (!this.dataArray) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerY = height / 2;
        
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        
        const sliceWidth = width / this.dataArray.length;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            // Convert from 0-255 (Uint8Array) to -1 to 1
            const v = (this.dataArray[i] - 128) / 128.0;
            const y = centerY + (v * centerY * 0.8);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Add glow effect
        this.addGlowEffect();
    }

    addGlowEffect() {
        if (!this.dataArray) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerY = height / 2;
        
        // Create glow effect
        this.ctx.shadowColor = this.lineColor;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        this.ctx.beginPath();
        
        const sliceWidth = width / this.dataArray.length;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const v = (this.dataArray[i] - 128) / 128.0;
            const y = centerY + (v * centerY * 0.8);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Reset shadow and alpha
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    setNumPoints(numPoints) {
        this.numPoints = numPoints;
    }

    setColors(lineColor, backgroundColor, gridColor) {
        this.lineColor = lineColor;
        this.backgroundColor = backgroundColor;
        this.gridColor = gridColor;
    }

    destroy() {
        // Clean up if needed
    }
}