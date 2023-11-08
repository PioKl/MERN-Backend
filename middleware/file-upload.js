const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid").v4;
const fs = require("fs");

const s3 = new AWS.S3();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const uploadToS3 = async (req, res, next) => {
  const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/images"); // Lokalny katalog do przechowywania plików
      },
      filename: (req, file, cb) => {
        const ext = MIME_TYPE_MAP[file.mimetype]; // Rozszerzenie pliku
        cb(null, uuid() + "." + ext);
      },
    }),

    // Sprawdzenie poprawności typu pliku
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype]; //!! jeśli undefined/null to konwersja do false, bądź true, jeśli było false(0,null, undefined) to będzie false, w przeciwnym wypadku true
      const error = isValid ? null : new Error("Invalid mime type!");
      cb(error, isValid);
    },
  });

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

      // Pobierz lokalną ścieżkę pliku
      const localFilePath = req.file.path;

      const ext = MIME_TYPE_MAP[req.file.mimetype];
      const Key = uuid() + "." + ext;

      await s3
        .upload({
          Body: fs.createReadStream(localFilePath),
          Bucket: process.env.CYCLIC_BUCKET_NAME,
          Key: Key,
        })
        .promise();

      // Usuń plik lokalny po przesłaniu do AWS S3
      fs.unlink(localFilePath, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload file to S3" });
    }
  });
};

module.exports = uploadToS3;
