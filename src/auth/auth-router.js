const express = require("express");
const AuthService = require("./auth-service");
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router();
const jsonBodyParser = express.json();

// used for logging in users 

authRouter.post("/login", jsonBodyParser, (req, res, next) => {
  const { user_name, password } = req.body;
  const loginUser = { user_name, password };
  var errvar = '';

  // if missing username or pass
  for (const [key, value] of Object.entries(loginUser))
    if (value == null) {
     
      if(key === user_name) errvar = "username."
      else if(key === password) errvar = "password."

      return res.status(400).json({
        error: `Missing '${errvar}'`,
      });
    }

  AuthService.getUserWithUserName(req.app.get("db"), loginUser.user_name)
    .then((dbUser) => {
      if (!dbUser)
        return res.status(400).json({
          error: "User doesn't exist",
        });

      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then((compareMatch) => {
        if (!compareMatch)
          return res.status(400).json({
            error: "Incorrect username or password",
          });

        const sub = dbUser.user_name;
        const payload = { user_id: dbUser.id };
        res.send({
          user: {
            type: dbUser.type,
            user_id: dbUser.id 
          },
          authToken: AuthService.createJwt(sub, payload),
        });
      });
    })
    .catch(next);
});

module.exports = authRouter;
