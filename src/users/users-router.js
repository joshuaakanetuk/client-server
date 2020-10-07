const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth')

// used to route user requests
usersRouter
  .post("/", jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name, email, type } = req.body;
    for (const field of ["full_name", "user_name", "password", "email"])
      if (!req.body[field]) {
        var errvar = '';
        switch(field) {
          case 'full_name':
              errvar = "Please enter your brand's name."
          case 'user_name':
              errvar = "Please enter your user."
          case 'password':
              errvar = "Password must be at least 8 character and contain 1 upper case, lower case, number and a special character."
          case 'email':
              errvar = "Please enter your email."
        }

        return res.status(400).json({
          error: errvar,
        });
      }
    const passwordError = UsersService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    UsersService.hasUserWithUserName(req.app.get("db"), user_name)
      .then((hasUserWithUserName) => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` });

        return UsersService.hashPassword(password).then((hashedPassword) => {
          const newUser = {
            user_name,
            type,
            email,
            password: hashedPassword,
            full_name,
            date_created: "now()",
          };

          return UsersService.insertUser(req.app.get("db"), newUser).then(
            (user) => {
              res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(UsersService.serializeUser(user));
            }
          );
        });
      })
      .catch(next);
  });

module.exports = usersRouter;
