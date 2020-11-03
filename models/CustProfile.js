const { Schema, model } = require("mongoose");

const customerProfileSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "Customer" },
  website: { type: String },
  address: { type: String },
  location: { type: String },
  phone: { type: String },
  company: { type: String },
  isOpen: { type: Boolean, default: false },
  bio: { type: String, required: true },
  skills: { type: Array }, //  [String] required: true
  social: {
    facebook: { type: String },
    youtube: { type: String },
    twitter: { type: String },
    linkdin: { type: String },
    instagram: { type: String }
  },
  experience: [
    {
      title: { type: String, required: true },
      company: { type: String, required: true },
      location: { type: String },
      from: { type: Date, required: true },
      to: { type: Date },
      current: { type: Boolean, required: false },
      description: { type: String, required: true }
    }
  ]
});

module.exports = model(
  "CustomerProfile",
  customerProfileSchema,
  "customer-profiles"
);
