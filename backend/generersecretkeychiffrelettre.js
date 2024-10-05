const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

// Fonction pour générer une clé secrète aléatoire avec des lettres minuscules et des chiffres
function generateSecretKey(length = 10) {
  if (length < 2) {
    throw new Error('La longueur de la clé doit être d\'au moins 2 caractères pour inclure une lettre et un chiffre.');
  }

  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const allChars = lowerChars + digits;

  // Assurez-vous d'avoir au moins une lettre et un chiffre
  let key = '';
  key += lowerChars[Math.floor(Math.random() * lowerChars.length)]; // Ajouter une lettre
  key += digits[Math.floor(Math.random() * digits.length)]; // Ajouter un chiffre

  // Compléter la clé avec des caractères aléatoires
  for (let i = 2; i < length; i++) {
    key += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger les caractères pour éviter des motifs prévisibles
  key = key.split('').sort(() => Math.random() - 0.5).join('');

  return key;
}

// Fonction pour initialiser la base de données avec des clés secrètes
async function initializeSecretkey() {
  const db = await open({
    filename: "./secretkey2.db",
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
    // Si aucune donnée n'existe, insérer 200 clés secrètes
    try {
      await db.run("BEGIN TRANSACTION");

      for (let i = 0; i < 200; i++) {
        const secretKey = generateSecretKey(10); // Générer une clé secrète de 10 caractères
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
