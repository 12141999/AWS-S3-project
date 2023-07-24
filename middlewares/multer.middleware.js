const multer = require("multer");
const fs = require("fs");
const path = require("path");

const bucketFolder = "bucketFolder";

// Upload File/Object Using Multer Middleware
const uploadFile = () => {
  return (fileUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const { bucketName } = req.query;
        if (!bucketName) {
          return cb(new Error("Bucket Name is mandatory"));
        }

        const bucketPath = path.join(bucketFolder, bucketName);

        if (!fs.existsSync(bucketPath))
          return cb(
            new Error("No bucket found , Please create the bucket first")
          );
        cb(null, bucketPath);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
      },
    }),
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
      cb(null, true);
    },
  }));
};

module.exports = uploadFile;
