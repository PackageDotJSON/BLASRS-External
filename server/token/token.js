const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { TOKEN_EXPIRY } = require("../constants/app.constant");
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

/**
 * Generates a token on user login
 * @param {string} cuin
 * @returns a unique token
 */
const generateToken = (cuin) => {
  return (token = jwt.sign({cuin}, privateKey, {expiresIn: TOKEN_EXPIRY}));
};

const verifyToken = (token, cuin) => {
  if (!token) {
    return "No Token Provided";
  }
  token = token.split(" ")[1];
  return jwt.verify(token, privateKey, (err, decoded) => {
    if (!err) {
      if(decoded.cuin !== cuin) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  });
};

module.exports = { generateToken, verifyToken };
