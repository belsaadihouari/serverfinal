const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');

// Remplace par ton URI MongoDB
const mongoURI = 'mongodb+srv://stat1401:NKHcI8JKX6PpBGAT@cluster0.kbcujks.mongodb.net/all-data?retryWrites=true&w=majority';

// Schéma Mongoose pour la collection MongoDB
const SecretKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }
});

const SecretKeyModel = mongoose.model('SecretKey', SecretKeySchema);

// Connexion à MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Connexion à SQLite
const db = new sqlite3.Database('./secretkey2.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connecté à SQLite');
    }
});

// Lire les données de SQLite
db.all('SELECT * FROM secretkey', [], async (err, rows) => {
    if (err) {
        throw err;
    }

    try {
        // Insérer les données dans MongoDB
        await SecretKeyModel.insertMany(rows);
        console.log('Données transférées avec succès !');
    } catch (insertErr) {
        console.error('Erreur lors de l\'insertion dans MongoDB:', insertErr);
    } finally {
        mongoose.connection.close();
        db.close();
    }
});
