const mongoose = require('mongoose');
const rdvschema = require('./models/rdvschema'); // Assure-toi que le chemin est correct

// Remplace par ton URI MongoDB
const mongoURI = 'mongodb+srv://stat1401:NKHcI8JKX6PpBGAT@cluster0.kbcujks.mongodb.net/all-data?retryWrites=true&w=majority';

async function getrdv() {
    // Connexion à MongoDB
    await mongoose.connect(mongoURI);

    try {
        // Trouver le premier créneau horaire disponible
        const slot = await rdvschema.findOne({ reserved: false })
            .sort({ date: 1, time: 1 })
            .exec();

        if (!slot) {
            return { error: "No available slots" };
        }

        // Marquer le créneau horaire comme réservé
        slot.reserved = true;
        await slot.save();

        // Retourner les détails du rendez-vous
        return {
            date: slot.date,
            time: slot.time,
        };
    } catch (error) {
        console.error("Error:", error);
        return { error: "Internal server error" };
    } finally {
        mongoose.connection.close(); // Fermer la connexion à MongoDB
    }
}

module.exports = {
    getrdv,
};
