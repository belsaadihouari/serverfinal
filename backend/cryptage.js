const crypto = require('crypto');
require("dotenv").config();

// Clé de cryptage fixe (doit être 32 octets pour AES-256)
const secretKey = crypto.scryptSync(process.env.SECRETKEY_CRYPTE, process.env.SALT, 32);
const algorithm = 'aes-256-cbc';

function encrypt(text) {
    const iv = crypto.randomBytes(16); // Un vecteur d'initialisation aléatoire
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}


function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}


// Fonction pour décrypter des données
function decrypt(encryptedData, iv) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Exporter les fonctions
module.exports = {
    encrypt,
    decrypt,
    hashEmail
};
