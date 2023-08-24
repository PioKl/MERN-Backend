const uuid = require("uuid").v4;

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Jane Doe",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req); //sprawdzi czy są jakieś błędy (żeby nie dodać pustego miejsca)
  if (!errors.isEmpty()) {
    throw new HttpError("Invaild inputs passed, please chceck you data.", 422);
  }

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError("Could not create user, email already exists", 422); //422 czyli wprowadzona wartość/input przez użytkownika jest nie prawidłowa
  }

  const createdUser = {
    id: uuid(),
    name, //name: name
    email,
    password,
  };
  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    ); //401 autentykacja się nie powiodła
  }

  res.json({ messae: "Logged in!" });
};

exports.getUsers = getUsers;

exports.signup = signup;

exports.login = login;
