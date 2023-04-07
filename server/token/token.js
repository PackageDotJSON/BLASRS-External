const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

/**
 * Generates a token on user login
 * @param {string} cuin
 * @returns a unique token
 */
const generateToken = (cuin) => {
  return (token = jwt.sign(cuin, privateKey));
};

const verifyToken = (token) => {

  if(!token) {
    return "No Token Provided";
  }
  token = token.split(' ')[1];
  return jwt.verify(token, privateKey, (err, decoded) => {
    if (!err) {
      return true;
    } else {
      return false;
    }
  });
};

module.exports = { generateToken, verifyToken };
