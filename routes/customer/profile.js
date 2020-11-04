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

router.post("/", authMiddleware, async (req, res) => {
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

    const {
      website,
      address,
      location,
      phone,
      bio,
      isOpen,
      skills,
      facebook,
      instagram,
      linkedin,
      twitter,
      youtube
    } = req.body;

    const profileFields = {};

    profileFields.customer = req.customer.customer;
    if (address) profileFields.address = address;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (phone) profileFields.phone = phone;
    if (isOpen) profileFields.isOpen = isOpen;
    if (skills) {
      profileFields.skills = skills.split(",").map(str => str.trim());
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;

    // check if the profile already exists, if so Update
    const custProfile = await CustProfile.findOne({
      customer: req.customer.customer
    });
    if (custProfile) {
      // Update the Profile
      const customerProfile = await CustProfile.findOneAndUpdate(
        {
          customer: req.customer.customer
        },
        {
          $set: profileFields
        },
        { new: true }
      );
      return res.status(200).json(customerProfile);
    }

    // Create customer profile
    customerProfile = new CustProfile(profileFields);
    await customerProfile.save();

    res.status(200).json(customerProfile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Unable to create Profile for the user" });
  }
});

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
 * Routee: /api/customer/profile/all GET
 * Get Customer Profile
 * Public Route
 */
router.get("/all", async (req, res, next) => {
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
