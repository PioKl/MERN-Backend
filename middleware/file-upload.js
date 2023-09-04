const multer = require("multer");
const uuid = require("uuid").v4;

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]; //extension
      cb(null, uuid() + "." + ext);
    },
  }),
  //żeby nie dodać pliku o złym rozszerzeniu
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; //!! jeśli undefined/null to konwersja do false, bądź true, jeśli było false(0,null, undefined) to będzie false, w przeciwnym wypadku true
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
