const express = require("express");
const bodyPares = require("body-parser");

const placesRoutes = require("./routes/places-routes");

const app = express();

//middleware

//ścieżka nie musi być "exact", ale musi się zaczynać specyficzną ścieżką
app.use("/api/places", placesRoutes);

app.listen(5000);
