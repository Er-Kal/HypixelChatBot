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
    const canvas = createCanvas(800, 50);
    const ctx = canvas.getContext('2d');
    ctx.font = '16px Minecraftia';

    ctx.textBaseline = 'top';
    // Clear canvas before drawing new text
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 10; // Starting position for text
    let y = 10;

    // Split the input text by the Minecraft color code delimiter (§)
    let segments = text.split('§');

    // Always start with the default color (white)
    let currentColor = minecraftColors['§f'];

    // Loop through each segment of text
    segments.forEach((segment, index) => {
        if (index === 0) {
            // This is the part before the first color code, just print it in default color
            ctx.fillStyle = currentColor;
            ctx.fillText(segment, x, y);
            x += ctx.measureText(segment).width;
        } else {
            // This is a colored section
            const colorCode = '§' + segment[0]; // Get the color code (e.g., §1, §2)
            if (minecraftColors[colorCode]) {
                currentColor = minecraftColors[colorCode];
                segment = segment.slice(1); // Remove the color code from the segment
            }
            // Draw the segment in the current color
            ctx.fillStyle = currentColor;
            ctx.fillText(segment, x, y);
            x += ctx.measureText(segment).width;
        }
    });
    const buffer = await canvas.toBuffer("image/png");
    return buffer;
}

module.exports = {
    drawMinecraftText,
}