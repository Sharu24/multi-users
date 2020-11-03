const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const { compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AES } = require("crypto-js");

const config = require("../config");

const Customer = require("../models/Customer");
const Admin = require("../models/Admin");

/**
 * @route : /api/auth
 * @description: Authorize
 * Public Route
 */
router.post(
  "/",
  [
    body("email", "Please enter valid email").isEmail(),
    body("password", "Please enter valid Password").notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      let { email, password } = req.body;

      let customer = await Customer.findOne({ email });
      let admin = await Admin.findOne({ email });

      if (customer) {
        const isMatch = await compare(password, customer.password);
        if (!isMatch) {
          return res.status(401).json({ Error: "Invalid Password" });
        }

        const payload = {
          customer: customer._id,
          role: customer.role
        };

        const token = await jwt.sign(payload, config.SECRET_KEY, {
          expiresIn: 1500
        });

        const cipherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();
        return res.status(200).json({ token: cipherToken });
      } else if (admin) {
        const isMatch = await compare(password, admin.password);
        if (!isMatch) {
          return res.status(401).json({ Error: "Invalid Password" });
        }

        const payload = {
          admin: admin._id,
          role: admin.role
        };

        const token = await jwt.sign(payload, config.SECRET_KEY, {
          expiresIn: 1500
        });

        const cipherToken = AES.encrypt(token, config.CRYPTO_KEY).toString();
        return res.status(200).json({ token: cipherToken });
      } else {
        return res.status(401).json({ Error: "Invalid User/Email" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ Error: "Server Error" });
    }
  }
);
module.exports = router;
