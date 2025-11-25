import CryptoJS from 'crypto-js';
import { createTransform } from 'redux-persist';

const SECRET_KEY = 'my-secret-key-jlpt-n1-master'; // In production, use env var

const encrypt = createTransform(
    (inboundState, key) => {
        if (!inboundState) return inboundState;
        const cryptedText = CryptoJS.AES.encrypt(JSON.stringify(inboundState), SECRET_KEY).toString();
        return cryptedText;
    },
    (outboundState, key) => {
        if (!outboundState) return outboundState;
        try {
            const bytes = CryptoJS.AES.decrypt(outboundState, SECRET_KEY);
            const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decrypted;
        } catch (err) {
            console.error("Decryption failed:", err);
            return outboundState;
        }
    },
    { whitelist: ['game'] } // Only encrypt 'game' slice if needed, or apply to all
);

export default encrypt;
