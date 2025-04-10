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
async function drawMinecraftText(text, options = {}) {
    const {
        maxWidth = 800,
        fontSize = 24,
        fontFamily = 'Minecraftia',
        padding = 8,
        lineHeight = 28
    } = options;

    // Create measurement context
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${fontSize}px ${fontFamily}`;

    // Calculate text metrics first
    let lines = 1;
    let currentLineWidth = 0;
    
    const segments = text.split('§');
    let currentColor = minecraftColors['§f'];
    
    // First pass: calculate number of lines needed
    segments.forEach((segment, index) => {
        if (index === 0 && segment) {
            processSegment(segment, currentColor);
        } else if (segment) {
            const colorCode = '§' + segment[0];
            if (minecraftColors[colorCode]) {
                currentColor = minecraftColors[colorCode];
                segment = segment.substring(1);
            }
            processSegment(segment, currentColor);
        }
    });

    function processSegment(text, color) {
        const words = text.split(/(?<= )/); // Split but keep spaces
        words.forEach(word => {
            const wordWidth = tempCtx.measureText(word).width;
            
            if (currentLineWidth + wordWidth > maxWidth - 2 * padding) {
                lines++;
                currentLineWidth = wordWidth;
            } else {
                currentLineWidth += wordWidth;
            }
        });
    }

    // Create final canvas
    const canvas = createCanvas(maxWidth, padding * 2 + lines * lineHeight);
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Render text
    currentColor = minecraftColors['§f'];
    let x = padding;
    let y = padding;
    currentLineWidth = 0;

    segments.forEach((segment, index) => {
        if (index === 0 && segment) {
            renderSegment(segment, currentColor,0,0);
        } else if (segment) {
            const colorCode = '§' + segment[0];
            if (minecraftColors[colorCode]) {
                currentColor = minecraftColors[colorCode];
                segment = segment.substring(1);
            }
            renderSegment(segment, currentColor,0,0);
        }
    });

    function renderSegment(text, color) {
        const words = text.split(/(?<= )/); // Split but keep spaces
        words.forEach(word => {
            const wordWidth = ctx.measureText(word).width;
            
            if (x + wordWidth > maxWidth - padding) {
                x = padding;
                y += lineHeight;
                currentLineWidth = wordWidth;
            } else {
                currentLineWidth += wordWidth;
            }
            
            ctx.fillStyle = color;
            ctx.fillText(word, x, y);
            x += wordWidth;
        });
    }

    return canvas.toBuffer('image/png');
}
module.exports = {
    drawMinecraftText,
}