const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rdvschema = new Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reserved: { type: Boolean, default: false },
  day_of_week: { type: String, required: true },
});

// Create a model based on that schema

const Rdv = mongoose.model("Rdv", rdvschema);

// export the model
module.exports = Rdv;
