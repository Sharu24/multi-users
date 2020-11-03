const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const randomstring = require("randomstring");
const { AES } = require("crypto-js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pug = require("pug");
const config = require("../../config");

const Mailer = require("../../controllers/mailControllers");

const Customer = require("../../models/Customer");
const Admin = require("../../models/Admin");

/**
 * @route : /api/admin/register
 * @description: To Register a New Admin
 * Public Route
 */

router.post(
  "/register",
  [
    body("name", "Please enter valid name")
      .notEmpty()
      .isString(),
    body("email", "Please enter valid email").isEmail(),
    body("role", "Role is required").notEmpty(),
    body("password", "Please enter valid Password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      let { name, email, role } = req.body;
      let customer = await Customer.findOne({ email });
      let admin = await Admin.findOne({ email });

      if (customer) {
        return res
          .status(500)
          .json({ Error: `${email} is already registered as a Customer` });
      }
      if (admin) {
        return res
          .status(500)
          .json({ Error: `${email} is already registered as a Admin` });
      }

      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const password = await bcrypt.hash(req.body.password, salt);

      const emailtoken = await randomstring.generate();

      admin = new Admin({ name, email, role, emailtoken, password });

      await admin.save();

      // Trigger Verification mail
      const verifyURL = `http://localhost:3000/api/admin/verify/${emailtoken}`;
      const subject = `XYZ Solutions Email Verification`;
      const html = pug.renderFile(__dirname + "/email.pug", {
        name: name,
        verifyURL: verifyURL
      });
      Mailer(email, subject, html);

      // Generate a token
      const payload = {
        admin: admin._id,
        role: admin.role
      };
      const token = await jwt.sign(payload, config.SECRET_KEY, {
        expiresIn: 500
      });

      // Encrypt the JSON Weeb Token
      const cipherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();

      //
      res.status(200).json({ token: cipherToken });
    } catch (err) {
      console.log(err);
      res.status(500).json({ Error: "Server Error" });
    }
  }
);

/**
 * @route : /api/admin/verify/:emailtoken
 * @description: To activate an admin
 * Public Route
 */

router.get("/verify/:emailtoken", async (req, res, next) => {
  try {
    const emailtoken = req.params.emailtoken;
    const data = await Admin.findOneAndUpdate(
      { emailtoken: emailtoken },
      { $set: { active: true } }
    );
    res.send(`<h1> User ${data.email} is verified Successfully </h1>`);
  } catch (err) {
    res.status(500).json({ Error: "Unable to Verify User" });
  }
});

module.exports = router;
