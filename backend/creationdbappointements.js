const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

// Fonction pour obtenir le jour de la semaine en texte
function getDayOfWeek(date) {
  const dayIndex = new Date(date).getDay();
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
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

async function initializeDatabase() {
  const db = await open({
    filename: "./appointments.db",
    driver: sqlite3.Database,
  });

  // Créer la table sans contrainte d'unicité
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reserved BOOLEAN NOT NULL DEFAULT 0,
      day_of_week TEXT NOT NULL
    );
  `);

  // Vérifier si des données existent déjà
  const countResult = await db.get(
    "SELECT COUNT(*) AS count FROM appointments"
  );
  if (countResult.count === 0) {
    // Si aucune donnée n'existe, insérer les créneaux horaires
    const slots = ["09:00", "10:00", "11:00"]; // Créneaux horaires
    const startDate = "2024-10-17"; // Date de début
    const endDate = "2024-11-30"; // Date de fin
    const days = getDatesInRange(startDate, endDate);

    try {
      await db.run("BEGIN TRANSACTION");

      for (const day of days) {
        if (isExcludedDay(day)) {
          continue; // Exclure les jours Vendredi et Samedi
        }

        for (const slot of slots) {
          const dayOfWeek = getDayOfWeek(day);
          await db.run(
            "INSERT INTO appointments (date, time, day_of_week) VALUES (?, ?, ?)",
            [day, slot, dayOfWeek]
          );
        }
      }

      await db.run("COMMIT");
    } catch (error) {
      await db.run("ROLLBACK");
      console.error("Error initializing database:", error);
    }
  }
}

module.exports = {
  initializeDatabase,
};
