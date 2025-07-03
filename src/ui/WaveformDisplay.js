/**
 * WaveformDisplay.js - Waveform visualization and selection control
 * Displays audio waveform and allows visual selection of grain regions
 */

export class WaveformDisplay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioBuffer = null;
        this.selectionStart = 0;
        this.selectionSize = 64;
        this.numChunks = 150; // Total chunks (matching original)
        
        // Visual properties
        this.waveformColor = '#60a5fa';
        this.selectionColor = 'rgba(37, 99, 235, 0.3)';
        this.selectionBorderColor = '#2563eb';
        this.backgroundColor = '#000000';
        this.gridColor = 'rgba(255, 255, 255, 0.1)';
        
        // Interaction
        this.onSelectionChange = null;
        this.isDragging = false;
        this.dragStartX = 0;
        
        this.setupEventListeners();
        this.initializeCanvas();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
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

    handleResize() {
        this.updateCanvasSize();
        this.draw();
    }

    setBuffer(audioBuffer) {
        this.audioBuffer = audioBuffer;
        this.draw();
    }

    setSelection(start, size) {
        this.selectionStart = start;
        this.selectionSize = size;
        this.draw();
    }

    clear() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, rect.width, rect.height);
    }

    drawGrid() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 4]);
        
        // Vertical grid lines (chunks)
        const chunkWidth = width / this.numChunks;
        for (let i = 0; i <= this.numChunks; i += 10) {
            const x = i * chunkWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Horizontal center line
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }

    drawWaveform() {
        if (!this.audioBuffer) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerY = height / 2;
        
        this.ctx.strokeStyle = this.waveformColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.8;
        
        const channelData = this.audioBuffer.getChannelData(0);
        const samplesPerPixel = channelData.length / width;
        
        this.ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            const startSample = Math.floor(x * samplesPerPixel);
            const endSample = Math.floor((x + 1) * samplesPerPixel);
            
            let min = 1;
            let max = -1;
            
            // Find min/max in this pixel range
            for (let i = startSample; i < endSample && i < channelData.length; i++) {
                const sample = channelData[i];
                if (sample < min) min = sample;
                if (sample > max) max = sample;
            }
            
            const y1 = centerY + (min * centerY * 0.8);
            const y2 = centerY + (max * centerY * 0.8);
            
            if (x === 0) {
                this.ctx.moveTo(x, y1);
            }
            
            this.ctx.lineTo(x, y1);
            this.ctx.lineTo(x, y2);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawSelection() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        const chunkWidth = width / this.numChunks;
        const selectionX = this.selectionStart * chunkWidth;
        const selectionWidth = this.selectionSize * chunkWidth;
        
        // Draw selection background
        this.ctx.fillStyle = this.selectionColor;
        this.ctx.fillRect(selectionX, 0, selectionWidth, height);
        
        // Draw selection borders
        this.ctx.strokeStyle = this.selectionBorderColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(selectionX, 0);
        this.ctx.lineTo(selectionX, height);
        this.ctx.moveTo(selectionX + selectionWidth, 0);
        this.ctx.lineTo(selectionX + selectionWidth, height);
        this.ctx.stroke();
        
        // Draw selection info
        this.drawSelectionInfo(selectionX, selectionWidth);
    }

    drawSelectionInfo(x, width) {
        const rect = this.canvas.getBoundingClientRect();
        const text = `${this.selectionStart}-${this.selectionStart + this.selectionSize}`;
        
        this.ctx.fillStyle = this.selectionBorderColor;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        
        const textX = x + width / 2;
        const textY = 20;
        
        // Draw text background
        const textMetrics = this.ctx.measureText(text);
        const textWidth = textMetrics.width + 8;
        const textHeight = 16;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(textX - textWidth/2, textY - textHeight/2, textWidth, textHeight);
        
        // Draw text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(text, textX, textY + 4);
    }

    drawCursors() {
        // Draw playback cursors if needed
        // This would be implemented to show grain trigger positions
    }

    draw() {
        this.clear();
        this.drawGrid();
        this.drawWaveform();
        this.drawSelection();
        this.drawCursors();
    }

    // Mouse event handlers
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        this.isDragging = true;
        this.dragStartX = x;
        
        // Set selection position based on click
        const chunkWidth = rect.width / this.numChunks;
        const clickedChunk = Math.floor(x / chunkWidth);
        
        this.selectionStart = Math.max(0, Math.min(this.numChunks - this.selectionSize, clickedChunk));
        this.draw();
        
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectionStart, this.selectionSize);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const chunkWidth = rect.width / this.numChunks;
        
        // Update selection based on drag
        const clickedChunk = Math.floor(x / chunkWidth);
        const startChunk = Math.floor(this.dragStartX / chunkWidth);
        
        if (clickedChunk !== startChunk) {
            this.selectionStart = Math.max(0, Math.min(this.numChunks - this.selectionSize, 
                Math.min(startChunk, clickedChunk)));
            this.selectionSize = Math.abs(clickedChunk - startChunk) + 1;
            
            this.draw();
            
            if (this.onSelectionChange) {
                this.onSelectionChange(this.selectionStart, this.selectionSize);
            }
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    handleMouseLeave(e) {
        this.isDragging = false;
    }

    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        
        this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp(e);
    }

    // Public methods
    setNumChunks(numChunks) {
        this.numChunks = numChunks;
        this.draw();
    }

    getSelectionTime() {
        if (!this.audioBuffer) return { start: 0, duration: 0 };
        
        const duration = this.audioBuffer.duration;
        const chunkDuration = duration / this.numChunks;
        
        return {
            start: this.selectionStart * chunkDuration,
            duration: this.selectionSize * chunkDuration
        };
    }

    destroy() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        window.removeEventListener('resize', this.handleResize);
    }
}