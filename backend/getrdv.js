const mongoose = require('mongoose');
const Rdv = require('./models/rdvschema.jsx'); // Assure-toi que le chemin est correct

async function getrdv() {
    try {
        // Pas besoin de se reconnecter ici
        const slot = await Rdv.findOne({ reserved: false })
            .sort({ date: 1, time: 1 })
            .exec();

        if (!slot) {
            return { error: "No available slots" };
        }

        slot.reserved = true;
        await slot.save();

        return {
            date: slot.date.toISOString(), // Retourne au format ISO
            time: slot.time,
        };
    } catch (error) {
        console.error("Error:", error);
        return { error: "Internal server error" };
    }
}

module.exports = {
    getrdv,
};
