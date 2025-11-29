/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
};

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
export const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if text should be light or dark based on background color
 * @param {string} hexColor - Background color in hex format
 * @returns {string} - 'white' or 'black'
 */
export const getContrastTextColor = (hexColor) => {
    if (!hexColor) return 'white';

    try {
        const { r, g, b } = hexToRgb(hexColor);
        const luminance = getLuminance(r, g, b);

        // WCAG threshold is 0.179
        // If luminance is greater than threshold, use dark text, otherwise use light text
        return luminance > 0.5 ? 'black' : 'white';
    } catch (error) {
        // Fallback to white if color parsing fails
        return 'white';
    }
};
