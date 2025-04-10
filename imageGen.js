// WRITTEN BY IamB34N


const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
registerFont('./minecraftia.ttf', { family: 'Minecraftia' });


// Minecraft color codes mapping
const minecraftColors = {
    '§0': '#000000', // Black
    '§1': '#0000AA', // Dark Blue
    '§2': '#00AA00', // Dark Green
    '§3': '#00AAAA', // Dark Aqua
    '§4': '#AA0000', // Dark Red
    '§5': '#AA00AA', // Dark Purple
    '§6': '#FFAA00', // Gold
    '§7': '#AAAAAA', // Gray
    '§8': '#555555', // Dark Gray
    '§9': '#5555FF', // Blue
    '§a': '#55FF55', // Green
    '§b': '#55FFFF', // Aqua
    '§c': '#FF5555', // Red
    '§d': '#FF55FF', // Light Purple
    '§e': '#FFFF55', // Yellow
    '§f': '#FFFFFF', // White
};
async function drawMinecraftText(text) {
    const {
        maxWidth = 800,  // Max canvas width before wrapping
        fontSize = 24,   // Font size
        fontFamily = 'Minecraftia', // Font family
        padding = 5,    // Padding around text
        lineHeight = 28  // Line height (adjust based on font size)
    } = options;

    // Create a temporary canvas to measure text width
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontSize}px ${fontFamily}`;

    // Split text into segments (for color codes)
    const segments = text.split('§');
    let currentColor = minecraftColors['§f']; // Default color (white)
    let totalWidth = 0;
    let lineWidth = 0;
    let lines = 1; // Start with 1 line

    // Calculate total width and check if wrapping is needed
    segments.forEach((segment, index) => {
        if (index === 0) {
            // First segment (no color code)
            lineWidth += tempCtx.measureText(segment).width;
        } else {
            // Handle color codes
            const colorCode = '§' + segment[0];
            if (minecraftColors[colorCode]) {
                currentColor = minecraftColors[colorCode];
                segment = segment.slice(1); // Remove color code
            }
            lineWidth += tempCtx.measureText(segment).width;
        }

        // If line exceeds maxWidth, move to next line
        if (lineWidth > maxWidth - 2 * padding) {
            lines++;
            lineWidth = tempCtx.measureText(segment).width; // Reset for new line
        }
    });

    // Calculate required canvas height
    const canvasHeight = padding * 2 + lines * lineHeight;

    // Create the final canvas with dynamic height
    const canvas = createCanvas(maxWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset variables for actual rendering
    currentColor = minecraftColors['§f'];
    let x = padding;
    let y = padding;

    // Render each segment with color and line wrapping
    segments.forEach((segment, index) => {
        if (index === 0) {
            // First segment (no color code)
            renderSegment(segment, currentColor);
        } else {
            // Handle color codes
            const colorCode = '§' + segment[0];
            if (minecraftColors[colorCode]) {
                currentColor = minecraftColors[colorCode];
                segment = segment.slice(1);
            }
            renderSegment(segment, currentColor);
        }
    });

    // Helper function to render a text segment with wrapping
    function renderSegment(text, color) {
        const words = text.split(' ');
        words.forEach(word => {
            const wordWidth = ctx.measureText(word + ' ').width;
            
            // If word exceeds line width, move to next line
            if (x + wordWidth > maxWidth - padding) {
                x = padding;
                y += lineHeight;
            }
            
            ctx.fillStyle = color;
            ctx.fillText(word, x, y);
            x += wordWidth;
        });
    }

    const buffer = canvas.toBuffer('image/png');
    return buffer;
}

module.exports = {
    drawMinecraftText,
}