const mongoose = require("mongoose");

// Connexion à MongoDB
async function connectDB() {
  await mongoose.connect('mongodb+srv://stat1401:NKHcI8JKX6PpBGAT@cluster0.kbcujks.mongodb.net/all-data?retryWrites=true&w=majority', {
    
  });
}

// Définition du schéma
const rdvschema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reserved: { type: Boolean, default: false },
  day_of_week: { type: String, required: true },
});

const Rdv = mongoose.model("Rdv", rdvschema);

// Fonction pour obtenir le jour de la semaine en texte
function getDayOfWeek(date) {
  const dayIndex = new Date(date).getDay();
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return days[dayIndex];
}

// Fonction pour vérifier si un jour est exclu (Vendredi ou Samedi)
function isExcludedDay(date) {
  const dayIndex = new Date(date).getDay();
  return dayIndex === 5 || dayIndex === 6; // 5 = Vendredi, 6 = Samedi
}

// Fonction pour générer une liste de dates entre deux dates
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Fonction pour initialiser la base de données avec des rendez-vous
async function initializeDatabase() {
  await connectDB();

  const count = await Rdv.countDocuments();
  if (count === 0) {
    const slots = ["09:00", "09:45", "10:30", "11:15"]; // Créneaux horaires
    const startDate = "2024-10-10"; // Date de début
    const endDate = "2024-11-30"; // Date de fin
    const days = getDatesInRange(startDate, endDate);

    for (const day of days) {
      if (isExcludedDay(day)) {
        continue; // Exclure les jours Vendredi et Samedi
      }

      for (const slot of slots) {
        const dayOfWeek = getDayOfWeek(day);
        const rdv = new Rdv({
          date: new Date(day),
          time: slot,
          day_of_week: dayOfWeek,
        });

        await rdv.save(); // Sauvegarde le rendez-vous dans MongoDB
      }
    }
  }
}

// Appel de la fonction pour initialiser la base de données
initializeDatabase()
  .then(() => {
    console.log("Rendez-vous initialisés avec succès !");
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Erreur lors de l'initialisation :", error);
    mongoose.connection.close();
  });
