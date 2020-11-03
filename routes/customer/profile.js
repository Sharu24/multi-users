const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../../controllers/authMiddleware");
const CustProfile = require("../../models/CustProfile");
const Customer = require("../../models/Customer");

const router = Router();

/**
 * Route: /api/customer/profile
 * Add Customer Profile
 * Private Route
 */

router.post(
  "/",
  [
    authMiddleware,
    [
      body("website", "Enter a valid website").isString(),
      body("address", "Enter a Valid Address")
        .isString()
        .isLength({ max: 150 }),
      body("location").isString(),
      body("phone").isString()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(500).json({ Error: errors.array() });
    }
    try {
      // Check if email is verified
      const customerData = await Customer.findById(req.customer.customer);
      if (!customerData) {
        return res.status(400).json({ Error: "UnAuthorized / Invalid User" });
      }
      if (!customerData.active) {
        return res.status(400).json({ Error: "Inactive Customer" });
      }

      // check if the profile already exists
      const custProfile = await CustProfile.findOne({
        customer: req.customer.customer
      });
      if (custProfile) {
        return res.status(400).json({ Error: " Profile Already Exists" });
      }
      const { website, address, location, phone, bio, skills } = req.body;

      const newCustProfile = new CustProfile({
        customer: req.customer.customer,
        website: website,
        address: address,
        location: location,
        phone: phone,
        bio: bio,
        skills: skills
      });

      await newCustProfile.save();

      res.status(200).json({ newCustProfile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: "Unable to create Profile for the user" });
    }
  }
);

/**
 * Routee: /api/customer/profile GET
 * Get Customer Profile
 * Private Route
 */

router.get("/", authMiddleware, async (req, res) => {
  try {
    const customerProfle = await CustProfile.findOne(
      {
        customer: req.customer.customer
      },
      "-_id -experience"
    ).populate("customer", "-_id -password -emailtoken -active");

    res.status(200).json({ customerProfle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Unable to fetch Customer Profile" });
  }
});

/**
 * Routee: /api/customer/profile GET
 * Get Customer Profile
 * Public Route
 */
router.get("/all", async (req, res) => {
  try {
    const customerProfle = await CustProfile.find(
      {},
      "-_id -address -phone -location"
    ).populate("customer", "name email -_id");

    res.status(200).json({ customerProfle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Unable to fetch Customer Profile" });
  }
});

module.exports = router;
