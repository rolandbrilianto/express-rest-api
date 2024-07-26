const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("No Authorization header provided");
    error.statusCode = 401;
    throw error; // 401 Unauthorized - Client does not provide valid authentication credentials.  The request requires user authentication.  The response must include a WWW-Authenticate header containing a challenge that can be used to authenticate the client.  In this case, we will send a 401 status code.  The client can then retry the request with the appropriate credentials.  If the client does not provide any credentials, the server must respond with a 400 status code and a challenge that allows the client to authenticate itself.  The client can then retry the request with the appropriate credentials.  The client may also retry the request with the appropriate credentials after receiving a 401 status code and a challenge that allows the client to authenticate itself.  In this case, the server will respond with a 401 status code and a challenge that allows
  }
  const token = authHeader.split(" ")[1];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, process.env.SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodeToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodeToken.userId;
  next();
};
