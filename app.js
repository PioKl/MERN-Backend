const express = require("express");
const bodyPares = require("body-parser");

const placesRoutes = require("./routes/places-routes");

const app = express();

//middleware
app.use(placesRoutes);

app.listen(5000);
