const jwt = require("jsonwebtoken");
const Mydata = require("../models/UserSchema");
require("dotenv").config();
const Mydatatoken = require("../models/tokenSchema");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const SecretKeyModel = require("../models/secrectkeyschema");

function verifiToken(req, res, next) {
  const tokenUrl = req.query.token;
  if (tokenUrl) {
    jwt.verify(tokenUrl, process.env.KEY_JWT, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token not valid" });
      } else {
        const user = await Mydatatoken.findOne({ iduser: decoded.id });
        if (!user) {
          return res.status(409).json({ error: "Email already verified" });
        } else if (user.stocktoken == tokenUrl) {
          req.id = {
            iduser: decoded.id,
          };
          next();
        } else {
          // Gérer d'autres cas non prévus
          return res
            .status(500)
            .json({ error: "Erreur lors de la confirmation de l'email" });
        }
      }
    });
  } else {
    return res.status(400).json({ error: "Token not found" });
  }
}

const ratingcheck = (req, res, next) => {
  let token;
  const authorizationHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (authorizationHeader) {
    [, token] = authorizationHeader.split(" ");
  }

  if (token) {
    jwt.verify(token, process.env.KEY_TOKEN, async (err, decoded) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        return;
      } else {
        // const currentUser = await Mydata.findById(decoded.id);
        req.id = {
          iduser: decoded.id,
          newrating: req.body.rating,
        };
        next();
      }
    });
  } else {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const pingro = (req, res, next) => {
return  res.status(200).json({ success: "true" });
};

const checkIfUser = (req, res, next) => {
  // const token = req.cookies.jwt;
  let token;
  const authorizationHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (authorizationHeader) {
    [, token] = authorizationHeader.split(" ");
  }

  if (token) {
    jwt.verify(token, process.env.KEY_TOKEN, async (err, decoded) => {
      if (err) {
        res.json({ errortoken: "Internal Server Error" });
        return;
      } else {
        const currentUser = await Mydata.findById(decoded.id);
        res.json({ user: currentUser });
        return;
      }
    });
  } else {
    return res.json({ errortoken: "Error" });
  }
};

const verifisecretkey = async (req, res, next) => {
  const reqSecretKey = req.body.secretkey; // Supposons que la clé est envoyée dans le corps de la requête

  if (!reqSecretKey) {
    return res.json({ secretkeyrequired: "Clé secrète requise." });
  }

  

  try {
    const isCurrentsecretkey = await SecretKeyModel.findOne({ key: reqSecretKey });
    if (isCurrentsecretkey) {
      req.secret = reqSecretKey;
      
      next();
    }else {
      // La clé secrète n'est pas trouvée
      res.status(401).json({ secretkeyinvalid: "Clé secrète invalide." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  } 
};



module.exports = {
  verifiToken,
  checkIfUser,
  ratingcheck,
  pingro,
  verifisecretkey,
  
};
