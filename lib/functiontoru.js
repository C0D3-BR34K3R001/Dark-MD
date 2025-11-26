/**
 * Currency formatting utilities for Indonesian Rupiah
 */

/**
 * Convert number to Indonesian Rupiah format
 * @param {number|string} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include "Rp" symbol
 * @param {string} decimalSeparator - Decimal separator (default: ',')
 * @returns {string} Formatted currency string
 */
exports.toRupiah = function(amount, includeSymbol = true, decimalSeparator = ',') {
    try {
        // Validate input
        if (amount === null || amount === undefined || amount === '') {
            throw new Error('Amount cannot be null, undefined, or empty');
        }

        // Convert to number and validate
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
            throw new Error('Invalid number format');
        }

        // Handle negative numbers
        const isNegative = numericAmount < 0;
        const absoluteAmount = Math.abs(numericAmount);

        // Split into integer and decimal parts
        const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split('.');
        
        // Format integer part with thousand separators
        let formattedInteger = integerPart.toString();
        const pattern = /(\d)(?=(\d{3})+(?!\d))/g;
        formattedInteger = formattedInteger.replace(pattern, '$1.');

        // Combine parts
        let result = decimalPart ? 
            `${formattedInteger}${decimalSeparator}${decimalPart}` : 
            formattedInteger;

        // Add negative sign if needed
        if (isNegative) {
            result = `-${result}`;
        }

        // Add currency symbol if requested
        if (includeSymbol) {
            result = `Rp ${result}`;
        }

        return result;
    } catch (error) {
        console.error('Error formatting Rupiah:', error.message);
        return includeSymbol ? 'Rp 0' : '0';
    }
}

/**
 * Parse Rupiah string back to number
 * @param {string} rupiahString - The Rupiah formatted string
 * @returns {number} Parsed number
 */
exports.fromRupiah = function(rupiahString) {
    try {
        if (!rupiahString || typeof rupiahString !== 'string') {
            throw new Error('Invalid input: must be a non-empty string');
        }

        // Remove "Rp" symbol, spaces, and thousand separators
        const cleanedString = rupiahString
            .replace(/^Rp\s?/i, '')  // Remove "Rp" prefix (case insensitive)
            .replace(/\./g, '')      // Remove thousand separators
            .replace(/,/g, '.')      // Convert decimal comma to dot
            .trim();

        const result = parseFloat(cleanedString);
        
        if (isNaN(result)) {
            throw new Error('Could not parse as number');
        }

        return result;
    } catch (error) {
        console.error('Error parsing Rupiah:', error.message);
        return 0;
    }
}

/**
 * Format number to Rupiah with different styling options
 * @param {number|string} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.symbol - Include "Rp" symbol (default: true)
 * @param {string} options.decimalSeparator - Decimal separator (default: ',')
 * @param {string} options.thousandSeparator - Thousand separator (default: '.')
 * @param {number} options.decimalPlaces - Number of decimal places (default: 2)
 * @param {boolean} options.spaceAfterSymbol - Add space after symbol (default: true)
 * @returns {string} Formatted currency string
 */
exports.formatRupiah = function(amount, options = {}) {
    const {
        symbol = true,
        decimalSeparator = ',',
        thousandSeparator = '.',
        decimalPlaces = 2,
        spaceAfterSymbol = true
    } = options;

    try {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
            throw new Error('Invalid number format');
        }

        const isNegative = numericAmount < 0;
        const absoluteAmount = Math.abs(numericAmount);

        // Format number with specified decimal places
        const fixedAmount = absoluteAmount.toFixed(decimalPlaces);
        const [integerPart, decimalPart] = fixedAmount.split('.');

        // Add thousand separators to integer part
        let formattedInteger = integerPart.toString();
        const pattern = new RegExp(`(\\d)(?=(\\d{3})+$)`, 'g');
        formattedInteger = formattedInteger.replace(pattern, `$1${thousandSeparator}`);

        // Build the result
        let result = decimalPart ? 
            `${formattedInteger}${decimalSeparator}${decimalPart}` : 
            formattedInteger;

        // Add negative sign
        if (isNegative) {
            result = `-${result}`;
        }

        // Add currency symbol
        if (symbol) {
            const space = spaceAfterSymbol ? ' ' : '';
            result = `Rp${space}${result}`;
        }

        return result;
    } catch (error) {
        console.error('Error formatting Rupiah:', error.message);
        return symbol ? 'Rp 0' : '0';
    }
}

/**
 * Validate if a string is a valid Rupiah amount
 * @param {string} input - The input to validate
 * @returns {boolean} True if valid Rupiah format
 */
exports.isValidRupiah = function(input) {
    if (!input || typeof input !== 'string') return false;
    
    // Pattern matches: Rp 1.000,00 or 1.000,00 or 1000,00 etc.
    const rupiahPattern = /^(Rp\s?)?-?\d{1,3}(\.\d{3})*(,\d{1,2})?$/;
    return rupiahPattern.test(input.trim());
}

/**
 * Extract numeric value from any Rupiah formatted string
 * @param {string} input - The Rupiah formatted string
 * @returns {number} Extracted numeric value
 */
exports.extractNumericValue = function(input) {
    try {
        if (!input || typeof input !== 'string') return 0;
        
        // Remove all non-numeric characters except minus, dot, and comma
        const numericString = input.replace(/[^\d,-]/g, '');
        
        // Replace comma with dot for decimal parsing
        const standardized = numericString.replace(',', '.');
        
        const result = parseFloat(standardized);
        return isNaN(result) ? 0 : result;
    } catch (error) {
        console.error('Error extracting numeric value:', error.message);
        return 0;
    }
}

/**
 * Format large numbers to abbreviated Rupiah (e.g., 1.5M, 2.3T)
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Abbreviated format
 */
exports.toAbbreviatedRupiah = function(amount, decimals = 1) {
    try {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
            throw new Error('Invalid number format');
        }

        const sizes = ['', 'Rb', 'Jt', 'M', 'T']; // Ribu, Juta, Miliar, Triliun
        const tier = Math.floor(Math.log10(Math.abs(numericAmount)) / 3);

        if (tier === 0) {
            return this.toRupiah(numericAmount, true);
        }

        const suffix = sizes[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = numericAmount / scale;
        
        return `Rp ${scaled.toFixed(decimals)} ${suffix}`;
    } catch (error) {
        console.error('Error formatting abbreviated Rupiah:', error.message);
        return 'Rp 0';
    }
}

// Example usage and test cases
if (require.main === module) {
    // Test the functions
    console.log('=== Rupiah Formatter Tests ===');
    
    const testAmounts = [1000, 50000, 1234567.89, -2500000, '750000'];
    
    testAmounts.forEach(amount => {
        console.log(`${amount} → ${exports.toRupiah(amount)}`);
        console.log(`${amount} → ${exports.formatRupiah(amount, { decimalPlaces: 0 })}`);
        console.log(`${amount} → ${exports.toAbbreviatedRupiah(amount)}`);
    });
    
    const testStrings = ['Rp 1.000.000,50', '500.000', 'Rp2.500.000'];
    
    testStrings.forEach(str => {
        console.log(`"${str}" → ${exports.fromRupiah(str)}`);
        console.log(`"${str}" valid? ${exports.isValidRupiah(str)}`);
    });
}