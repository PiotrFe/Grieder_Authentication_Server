const jwt = require("jwt-simple");
const config = require("../config");

const User = require("../models/user");

function tokenForUser(user) {
  const timestamp = new Date().getTime();

  // we can provide any object to encode a web token
  // convention is to provide "subject" and "issued at time"
  // subject can be email, user id etc. id better since email may change
  return jwt.encode({ sub: user._id, iat: timestamp }, config.secret);
}

exports.signin = (req, res, next) => {
  // passport (middleware in router) attached the user found to req
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .send({ error: "You must provide email and password" });
  }

  User.findOne({ email: email }, (err, existingUser) => {
    if (err) return next(err);

    if (existingUser) return res.status(422).send({ error: "Email is in use" });

    const user = new User({
      email,
      password,
    });

    user.save((err) => {
      if (err) return next(err);

      res.json({ token: tokenForUser(user) });
    });
  });
};
