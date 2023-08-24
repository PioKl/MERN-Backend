const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");

const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");

const app = express();

//middleware
app.use(bodyParser.json());

//middleware
//ścieżka nie musi być "exact", ale musi się zaczynać specyficzną ścieżką
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//middleware
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

//middleware w celu obsługi błędów
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(5000);
