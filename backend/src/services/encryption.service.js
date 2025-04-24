const crypto = require('crypto');
const config = require('../config'); // To get a secret key
const logger = require('../utils/logger');

// IMPORTANT: Use a strong, unique secret key stored securely (e.g., environment variable)
// Do NOT hardcode secrets. This is just for demonstration.
const ENCRYPTION_KEY = config.encryptionKey || 'default_dev_encryption_key_32bytes'; // Must be 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is always 16

if (ENCRYPTION_KEY === 'default_dev_encryption_key_32bytes') {
    logger.warn('Using default development encryption key. Set a secure ENCRYPTION_KEY environment variable in production!');
}
if (Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32 && Buffer.from(ENCRYPTION_KEY).length !== 32) {
     // Attempt to handle hex keys or plain text keys, ensure final key buffer is 32 bytes
     // This basic check might need refinement based on how the key is provided.
     logger.error('Invalid ENCRYPTION_KEY length. Must be 32 bytes (e.g., 64 hex characters).');
     // Potentially throw an error or exit in production if the key is invalid
}


/**
 * Encrypts text using AES-256-GCM.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text in format 'iv:encryptedData:authTag'. Returns null on error.
 */
exports.encrypt = (text) => {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        // Use a key derived from the environment variable, ensuring it's 32 bytes
        const keyBuffer = Buffer.from(ENCRYPTION_KEY, Buffer.from(ENCRYPTION_KEY, 'hex').length === 32 ? 'hex' : 'utf8');
        if (keyBuffer.length !== 32) {
            throw new Error('Encryption key must be 32 bytes.');
        }

        const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        // Combine IV, encrypted data, and auth tag. Use a separator unlikely to be in the data.
        return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    } catch (error) {
        logger.error(`Encryption failed: ${error.message}`, { stack: error.stack });
        return null; // Or throw error depending on desired handling
    }
};

/**
 * Decrypts text encrypted with AES-256-GCM.
 * @param {string} encryptedText - The encrypted text in format 'iv:encryptedData:authTag'.
 * @returns {string} - The decrypted text. Returns null if decryption fails or format is invalid.
 */
exports.decrypt = (encryptedText) => {
    if (!encryptedText || typeof encryptedText !== 'string') {
        logger.error('Decryption failed: Input must be a non-empty string.');
        return null;
    }
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format. Expected "iv:encryptedData:authTag".');
        }
        const [ivHex, encryptedDataHex, authTagHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        // Use a key derived from the environment variable, ensuring it's 32 bytes
        const keyBuffer = Buffer.from(ENCRYPTION_KEY, Buffer.from(ENCRYPTION_KEY, 'hex').length === 32 ? 'hex' : 'utf8');
         if (keyBuffer.length !== 32) {
            throw new Error('Decryption key must be 32 bytes.');
        }

        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        logger.error(`Decryption failed: ${error.message}`, { stack: error.stack });
        // Return null specifically for authentication tag mismatch or other crypto errors
        return null;
    }
};

// TODO: Add functions for hashing (e.g., API keys, passwords - though passwords often handled by bcrypt)
// exports.hashData = async (data) => { ... }
// exports.compareHash = async (data, hash) => { ... }
