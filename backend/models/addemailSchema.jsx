const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const defaultDate = new Date("1900-01-01T00:00:00Z");
const addemail = new Schema(
  {
    email: { type: String, required: true },
    flname: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 200,
    },
    group: { type: Number, required: true },
    secretkey: { type: String, required: true,minlength:10,maxlength:10 },

    isactive: { type: Boolean, default: false },
    rdv: { type: Date, default: defaultDate },
    hour: { type: String, default: "00:00" },
    sendrdv: { type: Date, default: defaultDate },
    emailhash: { type: String,default:""},
    ivemail:{type:String,default:""},
    ivflname:{type:String,default:""}
  },
  { timestamps: true }
);

// Create a model based on that schema
const addemailtop = mongoose.model("EmailAdded", addemail);

// export the model
module.exports = addemailtop;
