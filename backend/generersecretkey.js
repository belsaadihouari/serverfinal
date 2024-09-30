const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const crypto = require("crypto");

// Fonction pour générer une clé secrète aléatoire avec au moins une majuscule et un caractère spécial
function generateSecretKey(length = 10) {
  if (length < 3) {
    throw new Error('La longueur de la clé doit être au moins 3 pour inclure une majuscule et un caractère spécial.');
  }

  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowerChars + upperChars + specialChars + '0123456789';

  let key = '';
  key += upperChars[Math.floor(Math.random() * upperChars.length)];
  key += specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = 2; i < length; i++) {
    key += allChars[Math.floor(Math.random() * allChars.length)];
  }

  key = key.split('').sort(() => Math.random() - 0.5).join(''); // Mélange les caractères pour éviter des motifs prévisibles

  return key;
}

// Fonction pour initialiser la base de données avec des clés secrètes
async function initializeSecretkey() {
  const db = await open({
    filename: "./secretkey.db",
    driver: sqlite3.Database,
  });

  // Créer la table si elle n'existe pas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS secretkey (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE
    );
  `);

  // Vérifier si des données existent déjà
  const countResult = await db.get("SELECT COUNT(*) AS count FROM secretkey");
  if (countResult.count === 0) {
    // Si aucune donnée n'existe, insérer 50 clés secrètes
    try {
      await db.run("BEGIN TRANSACTION");

      for (let i = 0; i < 200; i++) {
        const secretKey = generateSecretKey(); // Générer une clé secrète
        await db.run("INSERT INTO secretkey (key) VALUES (?)", [secretKey]);
      }

      await db.run("COMMIT");
    } catch (error) {
      await db.run("ROLLBACK");
      console.error("Error initializing database:", error);
    }
  }
}

module.exports = {
  initializeSecretkey,
};
