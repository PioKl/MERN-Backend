const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

//w celu upewnienia się, że email jest unikalny, bo unique w email, jest żeby jak najszybciej  wykonywało się zapytanie
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
