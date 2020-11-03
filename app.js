const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Import DB
require("./dbConnect");

const customerRouter = require("./routes/customer");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");
const customerProfile = require("./routes/customer/profile");
const custProfileExperience = require("./routes/customer/experience");

app.use(express.json());
app.use("/api/customer", customerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/customer/profile", customerProfile);
app.use("/api/customer/profile/experience", custProfileExperience);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
