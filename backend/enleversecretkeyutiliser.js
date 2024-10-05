const mongoose = require('mongoose');
const addemailtop = require("./models/addemailSchema.jsx");
const SecretKeyModel = require("./models/secrectkeyschema.js");
const mongoURI = 'mongodb+srv://stat1401:NKHcI8JKX6PpBGAT@cluster0.kbcujks.mongodb.net/all-data?retryWrites=true&w=majority';

async function verifyAndRemoveSecretKeys() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connecté à MongoDB');

    // Récupérer toutes les clés secrètes
    const secretKeys = await SecretKeyModel.find();

    for (const secret of secretKeys) {
      // Vérifier si la clé existe dans la collection addemailtop
      const exists = await addemailtop.findOne({ secretkey: secret.key });

      console.log(`Vérification de la clé secrète : ${secret.key} - Existe : ${!!exists}`);

      if (exists) {
        // Si la clé existe, la supprimer de secretkey
        await SecretKeyModel.deleteOne({ _id: secret._id });
        console.log(`Clé secrète supprimée : ${secret.key}`);
      }
    }
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connexion à MongoDB fermée");
  }
}

// Exécution de la fonction
verifyAndRemoveSecretKeys();
