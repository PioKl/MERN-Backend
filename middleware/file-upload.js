const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid").v4;

const s3 = new AWS.S3();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000,
  storage: multer.memoryStorage(), // `memoryStorage` zamiast `diskStorage` dla przesyłania do AWS S3

  //żeby nie dodać pliku o złym rozszerzeniu
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; //!! jeśli undefined/null to konwersja do false, bądź true, jeśli było false(0,null, undefined) to będzie false, w przeciwnym wypadku true
    const error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

const uploadToS3 = async (req, res, next) => {
  fileUpload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(422).json({ message: "File upload failed." });
    }

    try {
      if (!req.file) {
        const error = new Error("No file provided");
        error.statusCode = 422;
        throw error;
      }

      const ext = MIME_TYPE_MAP[req.file.mimetype];
      const Key = uuid() + "." + ext;

      await s3
        .upload({
          Body: req.file.buffer,
          Bucket: process.env.CYCLIC_BUCKET_NAME,
          Key: Key,
        })
        .promise();

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload file to S3" });
    }
  });
};

module.exports = uploadToS3;
