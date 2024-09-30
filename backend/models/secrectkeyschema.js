const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SecretKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
});

// Create a model based on that schema

const SecretKeyModel = mongoose.model("SecretKey", SecretKeySchema);

// export the model
module.exports = SecretKeyModel;
