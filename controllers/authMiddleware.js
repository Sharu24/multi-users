const config = require("../config");
const { verify } = require("jsonwebtoken");
const { AES, enc } = require("crypto-js");

const auth = async (req, res, next) => {
  const token = req.headers["auth-token"];

  if (!token) {
    return res.status(401).json({ Error: "UnAuthorized. No Access Header" });
  }

  try {
    const bytes = AES.decrypt(token, config.CRYPTO_KEY);
    const decryptedToken = bytes.toString(enc.Utf8);
    const decodedToken = await verify(decryptedToken, config.SECRET_KEY);
    if (decodedToken.role === "customer") req.customer = decodedToken;
    else req.admin = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Token Expired. Login Again" });
  }
};

module.exports = auth;
