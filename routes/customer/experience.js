const express = require("express");
const router = express.Router();
const authMiddleware = require("../../controllers/authMiddleware");
const { body, validationResult } = require("express-validator");

const CustProfile = require("../../models/CustProfile");

/**
 * Add Experience to Customer Profile
 * Private Route
 */

router.put(
  "/",
  [
    authMiddleware,
    [
      body("title", "Tile is required")
        .notEmpty()
        .isString(),
      body("company", "Enter a Valid Company")
        .notEmpty()
        .isString(),
      body("from", "Duration - From is mandatory")
        .notEmpty()
        .isISO8601("yyyy-mm-dd"),
      body("description", "Enter a valid Description ")
        .notEmpty()
        .isString()
    ]
  ],
  async (req, res, next) => {
    console.log("I am here");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ Error: errors.array() });
    }
    try {
      // cheeck if the customer profile exists
      const custProfile = await CustProfile.findOne({
        customer: req.customer.customer
      });
      if (!custProfile) {
        return res.status(400).json({ Error: "No Customer Profile Found" });
      }

      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;

      const experience = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description
      };

      await CustProfile.updateOne(
        { customer: req.customer.customer },
        {
          $push: { experience: experience }
        }
      );

      res.status(200).json({ Success: "Updated Customer Experience" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: "Unable to add experience" });
    }
  }
);
module.exports = router;
