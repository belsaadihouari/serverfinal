const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchemachangerdv = new Schema(
  {
    stocktoken: { type: String, required: true },
    iduser:{ type: String, required: true }
  },
  { timestamps: true }
);

// Create a model based on that schema
const Mytokenchangerdv = mongoose.model("tokenchangerdv", tokenSchemachangerdv);

// export the model
module.exports = Mytokenchangerdv;
