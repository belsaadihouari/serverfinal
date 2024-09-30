const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const dbPromise = open({
  filename: "./appointments.db",
  driver: sqlite3.Database,
});

async function getrdv() {
  const db = await dbPromise;

  try {
    await db.run("BEGIN TRANSACTION");

    // Trouver le premier créneau horaire disponible
    const slot = await db.get(
      "SELECT id, date, time, day_of_week FROM appointments WHERE reserved = 0 ORDER BY date, time LIMIT 1"
    );

    if (!slot) {
      await db.run("ROLLBACK");
      return { error: "No available slots" };
    }

    // Marquer le créneau horaire comme réservé
    await db.run("UPDATE appointments SET reserved = 1 WHERE id = ?", [
      slot.id,
    ]);

    await db.run("COMMIT");

    // Retourner les détails du rendez-vous
    return {
      date: slot.date,
      time: slot.time,
    };
  } catch (error) {
    await db.run("ROLLBACK");
    return { error: "Internal server error" };
  }
}

module.exports = {
  getrdv,
};
