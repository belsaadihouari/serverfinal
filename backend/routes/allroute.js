const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const { check } = require("express-validator");
const {
  verifiToken,
  checkIfUser,
  ratingcheck,
  pingro,
  verifisecretkey,
} = require("../middelware/middelware");

router.get("/vuejs/agadir", controller.vuejs_agadir_get);
router.get("/ping", pingro);
router.get("/check", checkIfUser);
router.post(
  "/signup",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 8 characters with 1 upper case letter and 1 number"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
  ],
  controller.user_signup_post
);

router.post(
  "/addemail",
  [
    check("email", "Please provide a valid email").isEmail(),
    check("flname", "Please provide a correct Name")
      .isString()
      .notEmpty()
      .isLength({ min: 6, max: 30 }),
    check("group", "Please provide a number group")
      .isNumeric()
      .notEmpty()
      .toInt()
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Doit être supérieur à 0");
        }
        return true;
      }),
    check("secretkey", "Please provide a correct secret key")
      .isString()
      .notEmpty()
      .isLength({ min: 10, max: 10 }),
  ],
  
  verifisecretkey,
  controller.user_add_email
);

router.get("/confirmation", verifiToken, controller.user_confirmemail_get);

router.get("/confirmation2", verifiToken, controller.user_confirmemail2_get);

router.post(
  "/signin",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 8 characters with 1 upper case letter and 1 number"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
  ],
  controller.user_signin_post
);
router.get("/signout", controller.user_signout_get);
router.get("/data", controller.user_data_get);

router.post("/rating", ratingcheck, controller.user_rating_post);

router.post(
  "/contact",
  [check("email", "Please provide a valid email").isEmail()],
  controller.user_contact_post
);


router.get("/getsecret30082014", controller.user_getsecret_get);
router.get("/getpromoteursday", controller.user_getsecret2_get);

module.exports = router;
