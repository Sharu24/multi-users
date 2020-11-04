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
const authMiddleware = require("../../controllers/authMiddleware");

const Customer = require("../../models/Customer");
const CustProfile = require("../../models/CustProfile");
const Admin = require("../../models/Admin");

/**
 * @route : /api/customer/register
 * @description: To Register a New Customer
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

      customer = new Customer({ name, email, role, emailtoken, password });

      await customer.save();

      // Trigger Verification mail
      const verifyURL = `http://localhost:3000/api/customer/verify/${emailtoken}`;
      const subject = `XYZ Solutions Email Verification`;
      const html = pug.renderFile(__dirname + "/email.pug", {
        name: name,
        verifyURL: verifyURL
      });
      Mailer(email, subject, html);

      // Generate a token
      const payload = {
        customer: customer._id,
        role: customer.role
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

router.get("/verify/:emailtoken", async (req, res, next) => {
  try {
    const emailtoken = req.params.emailtoken;
    const data = await Customer.findOneAndUpdate(
      { emailtoken: emailtoken },
      { $set: { active: true } }
    );
    res.status(200).json({ Success: "User Verified Successfully" });
  } catch (err) {
    res.status(500).json({ Error: "Unable to Verify User" });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    const customerId = req.customer.customer;
    if (!customerId) {
      return res.status(400).json({ Error: "Unauthorized User" });
    }
    await Customer.findOneAndDelete({ _id: customerId });
    await CustProfile.findOneAndDelete({ customer: customerId });

    res.status(200).json({ Success: "Customer is Removed" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ Error: "Could not Delete Customer Record" });
  }
});

module.exports = router;
