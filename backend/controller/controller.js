const Mydata = require("../models/UserSchema");
const addemailtop = require("../models/addemailSchema.jsx");
const Mydatatoken = require("../models/tokenSchema");
const Mytokenchangerdv = require("../models/tokenSchemachangerdv.js");
const DataSchema = require("../models/DataSchema.jsx");
const contactSchema = require("../models/contactSchema.jsx");
const nodemailercde = require("../nodemailer/nodemailercde.js");
const nodemailer = require("../nodemailer/nodemailer.js");
const nodemailerchangerdv = require("../nodemailer/nodemailerchangerdv");
const nodemailercontact = require("../nodemailer/nodemailercontact.js");
const nodmailercontactforuser = require("../nodemailer/nodmailercontactforuser.js");
const nodemailerrdv = require("../nodemailer/nodemailerrdv.js");
const nodemailerchangedrdv = require("../nodemailer/nodemailerchangedrdv.js");
const { validationResult } = require("express-validator");
const SecretKeyModel = require("../models/secrectkeyschema.js");
const rdvschema = require("../models/rdvschema.jsx");
const { getrdv } = require("../getrdv.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const sqlite3 = require("sqlite3").verbose();
// const { open } = require("sqlite");
const { hashEmail, encrypt, decrypt } = require("../cryptage.js");

require("dotenv").config();

function formatDate(dateString) {
  // Créer un objet Date à partir de la chaîne
  const date = new Date(dateString);

  // Extraire le jour, le mois et l'année
  const day = String(date.getUTCDate()).padStart(2, "0"); // Jour
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Mois (0-11)
  const year = date.getUTCFullYear(); // Année

  // Retourner la date au format DD/MM/YYYY
  return `${day}/${month}/${year}`;
}

const user_signup_post = async (req, res) => {
  try {
    const objError = validationResult(req);
    if (objError.errors.length > 0) {
      return res.json({ validatorError: objError.errors });
    }

    const isCurrentEmail = await Mydata.findOne({ email: req.body.email });
    if (isCurrentEmail) {
      return res.json({ isCurrentEmail: "Email already exists" });
    }
    const salt = await bcrypt.genSalt();
    const phachedpassword = await bcrypt.hash(req.body.password, salt);

    const data = new Mydata({ ...req.body, password: phachedpassword });
    await data.save();
    res.json({ id: data._id });

    const token = jwt.sign(
      { id: data._id, email: data.email },
      process.env.KEY_JWT,
      { expiresIn: "1d" }
    );

    const datatoken = new Mydatatoken({ stocktoken: token, iduser: data._id });
    await datatoken.save();

    const confirmationLink = `${process.env.BASE_URLFRONTPRODU}confirmation?token=${token}`;
    nodemailer(data.email, confirmationLink);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const user_confirmemail_get = async (req, res) => {
  try {
    const reqID = req.id.iduser;
    const user = await Mydata.findOne({ _id: reqID });
    if (user) {
      user.isactive = true;
      await user.save();
      res.status(200).send("email confirmé.");
      await Mydatatoken.deleteOne({ iduser: reqID });

      return;
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la confirmation de l'email.");
  }
};

const user_confirmemail2_get = async (req, res) => {
  try {
    const reqID = req.id.iduser;
    const user = await addemailtop.findOne({ _id: reqID });

    if (user) {
      const rdvous = await getrdv();
      user.isactive = true;
      user.rdv = rdvous.date;
      user.hour = rdvous.time;
      const now = new Date();
      user.sendrdv = now;
      // await user.save();

      await user.save(); // Gestion des erreurs de sauvegarde

      await Mydatatoken.deleteOne({ iduser: reqID });

      const decrypted = decrypt(user.email, user.ivemail);
      const dateString = rdvous.date;
      const formattedDate = formatDate(dateString);
      nodemailerrdv(decrypted, formattedDate, rdvous.time);

      res.status(200).send("email confirmé.");
      return;
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const user_changerdv_post = async (req, res) => {
  try {
    const reqID = req.id.iduser;

    const user = await addemailtop.findOne({ _id: reqID });

    if (user) {
      if (user.changerdv == false) {
        const firstdate = user.rdv;
        const firsthour = user.hour;
        const verifydate = await rdvschema.findOne({
          date: firstdate,
          time: firsthour,
        });

        const rdvs = await rdvschema.findOne({
          date: req.body.date,
          time: req.body.hour,
        });

        if (verifydate && rdvs) {
          verifydate.reserved = false;
          rdvs.reserved = true;
          user.rdv = req.body.date;
          user.hour = req.body.hour;
          user.changerdv = true;

          
          res.json({ rdvchanged: "Appointment changed successfully" });

          
          Promise.all([
            verifydate.save(),
            rdvs.save(),
            user.save(),
            Mytokenchangerdv.deleteOne({ iduser: reqID }),
          ]).then(() => {
            const decrypted = decrypt(user.email, user.ivemail);
            const formattedDate = formatDate(user.rdv);
            nodemailerchangedrdv(decrypted, formattedDate, user.hour);
          }).catch(err => {
            console.error("Error during saving or sending email:", err);
          });
        }
      } else {
        return res.json({
          rdvalreadychanged: "Appointment has already been changed once",
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
};





// const user_changerdv_post = async (req, res) => {
//   try {
//     const reqID = req.id.iduser;

//     const user = await addemailtop.findOne({ _id: reqID });

//     if (user) {
//       if (user.changerdv == false) {
//         const firstdate = user.rdv;
//         const firsthour = user.hour;
//         const verifydate = await rdvschema.findOne({
//           date: firstdate,
//           time: firsthour,
//         });

//         const rdvs = await rdvschema.findOne({
//           date: req.body.date,
//           time: req.body.hour,
//         });

//         if (verifydate && rdvs) {
//           verifydate.reserved = false;
//           rdvs.reserved = true;
//           user.rdv = req.body.date;
//           user.hour = req.body.hour;
//           user.changerdv = true;
//           await verifydate.save();
//           await rdvs.save();
//           await user.save();
//         }

//         await Mytokenchangerdv.deleteOne({ iduser: reqID });
//         const decrypted = decrypt(user.email, user.ivemail);

//         const dateString = user.rdv;

//         const formattedDate = formatDate(dateString);
//         res.json({ rdvchanged: "appointment changed successufly" });
//         nodemailerchangedrdv(decrypted, formattedDate, user.hour);
        
//       } else {
//         return res.json({
//           rdvalreadychanged: "Appointment has already been changed once",
//         });
//       }
//     }
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

const user_signin_post = async (req, res) => {
  try {
    const objError = validationResult(req);
    if (objError.errors.length > 0) {
      return res.json({ validatorError: objError.errors });
    }

    const verification = await Mydata.findOne({ email: req.body.email });
    if (!verification) {
      return res.json({ verification: "Incorrect username or password1" });
    }
    if (!verification.isactive) {
      return res.json({ emailconfirm: "Please confirm your email" });
    }

    const match = await bcrypt.compare(
      req.body.password,
      verification.password
    );
    if (match) {
      const token = jwt.sign({ id: verification._id }, process.env.KEY_TOKEN, {
        expiresIn: "12h",
      });
      // res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000,secure: true,sameSite: 'None' }); //secure: true, sameSite: 'strict' ajouter ces deux code au cookie
      res.json({
        id: verification._id,
        rating: verification.rating,
        email: verification.email,
        token,
      });
    } else {
      return res.json({ verification: "Incorrect username or password2" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const user_signout_get = async (req, res) => {
  try {
    res.cookie("jwt", "", { expires: new Date(0) }); // Définir la date d'expiration sur une date passée
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};

const user_data_get = async (req, res) => {
  try {
    const user = await DataSchema.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const user_rating_post = async (req, res) => {
  try {
    const reqID = req.id.iduser;
    const user = await Mydata.findOne({ _id: reqID });

    if (user) {
      user.rating = req.id.newrating;
      await user.save();
      res.status(200).send("rating confirmé.");
      return;
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la rating de l'email.");
  }
};

const user_contact_post = async (req, res) => {
  try {
    const objError = validationResult(req);
    if (objError.errors.length > 0) {
      return res.json({ validatorError: objError.errors });
    }
    if (req.body.textmessage.length < 10 || req.body.textmessage.length > 250) {
      return res.json({ validatorErrormessage: "error message lenght" });
    }
    const data = new contactSchema({
      email: req.body.email,
      textmessage: req.body.textmessage,
    });
    await data.save();
    nodemailercontact(data.email, data.textmessage);
    nodmailercontactforuser(data.email);
    res.status(200).json({ success: "success" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const vuejs_agadir_get = async (req, res) => {
  try {
    const filleDeAgadir = {
      delapart: "Houari",
      fille: "Amina",
      age: "non defini",
      ville: "Agadir",
      payes: "Maroc",
    };
    res.status(200).json(filleDeAgadir);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

const user_add_email = async (req, res) => {
  try {
    const notvide = await rdvschema.countDocuments();
    if (notvide < 1) {
      return res.json({ emptytable: "Aucun rendez-vous disponible." });
    }

    const objError = validationResult(req);
    if (objError.errors.length > 0) {
      return res.json({ validatorError: objError.errors });
    }

    const monjour = new Date();

    const hashedEmail = hashEmail(req.body.email);

    const isCurrentEmail = await addemailtop.findOne({
      emailhash: hashedEmail,
      $or: [
        { rdv: { $gt: monjour } },
        { rdv: new Date("1900-01-01T00:00:00.000Z") },
      ],
    });

    if (isCurrentEmail) {
      if (isCurrentEmail.isactive === false) {
        const trenteJoursEnMillis = 30 * 24 * 60 * 60 * 1000;
        const differenceEnMillis = monjour - isCurrentEmail.createdAt;
        if (differenceEnMillis < trenteJoursEnMillis) {
          return res.json({
            isCurrentEmailverify: "Veuillez confirmer votre adresse e-mail.",
          });
        } else {
          const deleteuser = await addemailtop.deleteOne({
            email: isCurrentEmail.email,
          });
          const deletetoken = await Mydatatoken.deleteOne({
            iduser: isCurrentEmail._id,
          });
        }
      }

      if (isCurrentEmail.isactive === true) {
        if (isCurrentEmail.rdv >= monjour) {
          return res.json({ isCurrentEmail: "Email already exists" });
        }
      }
    }

    const { iv: ivemail, encryptedData } = encrypt(req.body.email);
    const { iv: ivflname, encryptedData: encryptedflname } = encrypt(
      req.body.flname
    );
    const user = {
      email: encryptedData,
      flname: encryptedflname,
      group: req.body.group,
      secretkey: req.body.secretkey,
      ivemail: ivemail,
      ivflname: ivflname,
      emailhash: hashedEmail,
    };

    const data = new addemailtop(user);
    await data.save();
    res.json({ id: data._id });

    const token = jwt.sign({ id: data._id }, process.env.KEY_JWT, {
      expiresIn: "30d",
    });

    const datatoken = new Mydatatoken({ stocktoken: token, iduser: data._id });
    await datatoken.save();

    const confirmationLink = `${process.env.BASE_URLFRONTPRODU}confirmation2?token=${token}`;
    nodemailercde(req.body.email, confirmationLink);
    const getsecretkey = await SecretKeyModel.deleteOne({
      key: req.body.secretkey,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const user_getsecret_get = async (req, res) => {
  const { password } = req.params;
  if (password === "Stat1401@") {
    try {
      // Rechercher toutes les clés secrètes dans la base de données
      const secretKeys = await SecretKeyModel.find({});
      const appointments = await rdvschema.find({ reserved: false });

      // Retourner les résultats sous forme de tableau JSON
      const keys = secretKeys.map((row) => row.key);
      const slots = appointments.map((row) => ({
        date: row.date,
        time: row.time,
      }));

      res.json({ secretKeys: keys, slots });
    } catch (error) {
      console.error("Error fetching secret keys:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des clés secrètes." });
    }
  }
};

// const user_getsecret2_get = async (req, res) => {
//   const {  password } = req.params;
//   if (password==="Stat1401@") {
//     try {
//       const today = new Date();

//       // Fonction pour formater la date au format YYYY-MM-DD
//       const formatDate = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0"); // Ajouter un zéro si nécessaire
//         const day = String(date.getDate()).padStart(2, "0"); // Ajouter un zéro si nécessaire
//         return `${year}-${month}-${day}`;
//       };

//       // Récupérer la date formatée
//       const formattedDate = formatDate(today);

//       const promoteurs = await addemailtop
//         .find({ isactive: true, rdv: formattedDate })
//         .select("flname ivflname hour -_id");
//       const decryptedResults = promoteurs.map((promoteur) => ({
//         flname: decrypt(promoteur.flname, promoteur.ivflname),
//         hour: promoteur.hour,
//       }));

//       res.json(decryptedResults);
//     } catch (error) {
//       console.error("Error fetching secret keys:", error);
//       res
//         .status(500)
//         .json({ message: "Erreur lors de la récupération des clés secrètes." });
//     }
//   }

// };

const user_getsecret2_get = async (req, res) => {
  const { password } = req.params;
  if (password === "Stat1401@") {
    try {
      const today = new Date();

      // Récupérer l'heure d'Algerie (UTC+1)
      const options = {
        timeZone: "Africa/Algiers",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const formatter = new Intl.DateTimeFormat("fr-FR", options);
      const parts = formatter.formatToParts(today);

      // Extraire l'année, le mois et le jour
      const year = parts.find((part) => part.type === "year").value;
      const month = parts
        .find((part) => part.type === "month")
        .value.padStart(2, "0");
      const day = parts
        .find((part) => part.type === "day")
        .value.padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      const promoteurs = await addemailtop
        .find({ isactive: true, rdv: formattedDate })
        .select("flname ivflname hour -_id");

      const decryptedResults = promoteurs.map((promoteur) => ({
        flname: decrypt(promoteur.flname, promoteur.ivflname),
        hour: promoteur.hour,
      }));

      res.json(decryptedResults);
    } catch (error) {
      console.error("Error fetching secret keys:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des clés secrètes." });
    }
  }
};

const user_getsecret3_get = async (req, res) => {
  const id = req.id.iduser;
  const user = await addemailtop.findOne({ _id: id });

  try {
    const promoteurs = await rdvschema
      .find({ reserved: false, date: { $gt: user.rdv } })
      .select("date time _id");

    res.json({ promoteurs, datas: "data is available" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des clés secrètes." });
  }
};

// const user_verifyemail_post = async (req, res) => {
//   try {
//     const objError = validationResult(req);
//     if (objError.errors.length > 0) {
//       return res.json({ validatorError: objError.errors });
//     }
//     const today = new Date();
//     const dateAfter48Hours = new Date(today); // Créer une copie de la date actuelle
//     dateAfter48Hours.setHours(today.getHours() + 48);
//     const hashedEmail = hashEmail(req.body.email);

//     const promoteurs = await addemailtop.findOne({

//       emailhash: hashedEmail,
//       isactive: true,
//       rdv: { $gt: dateAfter48Hours }, // Vérifiez que rdv est supérieur à formattedDate + 48 heures
//     });

//     if (promoteurs.changerdv===false) {
//       const token = jwt.sign(
//         { id: promoteurs._id, email: promoteurs.email },
//         process.env.KEY_JWT,
//         { expiresIn: "1h" }
//       );

//       const datatoken = new Mytokenchangerdv({
//         stocktoken: token,
//         iduser: promoteurs._id,
//       });
//       await datatoken.save();

//       const confirmationLink = `http://localhost:5173/changeappointment?token=${token}`;
//       nodemailerchangerdv(
//         decrypt(promoteurs.email, promoteurs.ivemail),
//         confirmationLink
//       );
//       res.json({ message: "ok" });
//     } else{
//       if (promoteurs.changerdv===true) {
//         res.json({ rdvalreadychanged: "appointment already changed" });
//       }else{
//         if (promoteurs!==null) {
//           res.json({ notexist: "not exist" });
//         }
//       }
//     }

//   } catch (error) {
//     console.error("Error fetching email:", error);
//     res.status(500).json({ message: "Error." });
//   }
// };

const user_verifyemail_post = async (req, res) => {
  try {
    const objError = validationResult(req);
    if (objError.errors.length > 0) {
      return res.json({ validatorError: objError.errors });
    }

    const today = new Date();
    const dateAfter48Hours = new Date(today);
    dateAfter48Hours.setHours(today.getHours() + 48);
    const hashedEmail = hashEmail(req.body.email);

    const promoteurs = await addemailtop.findOne({
      emailhash: hashedEmail,
      isactive: true,
      rdv: { $gt: dateAfter48Hours }, // Vérifiez que rdv est supérieur à 48 heures
    });

    if (promoteurs) {
      // Vérifiez si promoteurs existe
      if (promoteurs.changerdv === false) {
        const token = jwt.sign(
          { id: promoteurs._id, email: promoteurs.email },
          process.env.KEY_JWT,
          { expiresIn: "1h" }
        );

        const datatoken = new Mytokenchangerdv({
          stocktoken: token,
          iduser: promoteurs._id,
        });
        await datatoken.save();

        const confirmationLink = `https://houaribelsaadi.dev/changeappointment?token=${token}`;
        nodemailerchangerdv(
          decrypt(promoteurs.email, promoteurs.ivemail),
          confirmationLink
        );
        return res.json({ message: "ok" });
      } else {
        return res.json({ rdvalreadychanged: "appointment already changed" });
      }
    } else {
      const promoteurs2 = await addemailtop.findOne({
        emailhash: hashedEmail,
        isactive: true,
        rdv: { $gte: today }, 
      });
      if (promoteurs2) {
        return res.json({ moin48: "moin 48 heures" });
      }else{
        return res.json({ notexist: "not exist" });
      }
      
    }
  } catch (error) {
    console.error("Error fetching email:", error);
    res.status(500).json({ message: "Error." });
  }
};

module.exports = {
  user_signup_post,
  user_confirmemail_get,
  user_confirmemail2_get,
  user_signin_post,
  user_signout_get,
  user_data_get,
  user_rating_post,
  user_contact_post,
  vuejs_agadir_get,
  user_add_email,
  user_getsecret_get,
  user_getsecret2_get,
  user_getsecret3_get,
  user_verifyemail_post,
  user_changerdv_post,
};
