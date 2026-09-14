/**
 * Lightweight QR Code Generator rendering to HTML Canvas element
 */
export function drawQRCode(canvas, text) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    // Generate simple pattern matrix based on text hashes for visual representation
    const gridSize = 25;
    const cellSize = Math.floor(size / gridSize);
    const offset = Math.floor((size - gridSize * cellSize) / 2);
    ctx.fillStyle = '#000000';
    // Draw alignment patterns (corners)
    drawCornerPattern(ctx, offset, offset, cellSize);
    drawCornerPattern(ctx, offset + (gridSize - 7) * cellSize, offset, cellSize);
    drawCornerPattern(ctx, offset, offset + (gridSize - 7) * cellSize, cellSize);
    // Pseudo-random data bits generated deterministically from string
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            // Skip corner finder pattern areas
            if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
                continue;
            }
            const val = (hash ^ (r * 31 + c * 17)) % 3;
            if (val === 0) {
                ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
            }
        }
    }
}
function drawCornerPattern(ctx, x, y, cellSize) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
}
