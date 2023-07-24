const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const uploadFile = require("../middlewares/multer.middleware");
const fs = require("fs");
const path = require("path");
const objectModel = require("../models/object.model");

const bucketFolder = "bucketFolder";

//Bucket Creation Api
router.post("/createBucket", authMiddleware, (req, res) => {
  const { bucketName } = req.body;
  if (!bucketName) {
    return res.json({
      error: { status: 404, msg: "Bucket Name is mandatory" },
    });
  }
  const bucketPath = path.join(bucketFolder, bucketName);

  try {
    if (fs.existsSync(bucketPath))
      res.json({ success: { status: 200, msg: "Bucket is already created" } });
    else {
      fs.mkdirSync(bucketPath, { recursive: true });
      res.json({
        success: { status: 200, msg: "Bucket is created successfully" },
      });
    }
  } catch (err) {
    res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
});

//Get All Bucket List
router.get("/listBuckets", authMiddleware, (req, res) => {
  if (!fs.existsSync(bucketFolder))
    res.json({ success: { status: 200, msg: "No bucket found" } });
  fs.readdir(bucketFolder, (err, folders) => {
    const buckets = folders.filter((folder) => {
      const folderPath = path.join(bucketFolder, folder);
      return fs.statSync(folderPath).isDirectory();
    });
    if (buckets.length > 0)
      return res.json({
        success: {
          status: 200,
          msg: "Buckets found successfully",
          data: buckets,
        },
      });
    else res.json({ success: { status: 200, msg: "No bucket found" } });
  });
});

//Upload File/Object Api Using Multer Middleware
router.post(
  "/uploadObject",
  authMiddleware,
  uploadFile().single("file"),
  async (req, res) => {
    if (req.file) {
      const { destination, filename, mimetype } = req.file;
      const filePath = path.join(destination, filename);
      const uploadedObject = await objectModel.create({
        userId: req.user._id,
        fileName: filename,
        fileType: mimetype,
        path: filePath,
      });
      return res.json({
        success: {
          status: 200,
          msg: "File uploaded successfully",
          data: uploadedObject,
        },
      });
    } else
      return res.json({ error: { status: 404, msg: "File is mandatory" } });
  }
);

// Get All Files/Objects
router.get("/listObjects", authMiddleware, async (req, res) => {
  const { bucketName } = req.body;
  if (!bucketName)
    return res.json({
      error: { status: 404, msg: "Bucket Name is mandatory" },
    });

  try {
    const bucketPath = path.join(bucketFolder, bucketName);
    fs.readdir(bucketPath, (err, files) => {
      const allFiles = files.filter((file) => {
        const filePath = path.join(bucketPath, file);
        return fs.statSync(filePath).isFile();
      });
      if (allFiles.length > 0)
        return res.json({
          success: {
            status: 200,
            msg: "File found successfully",
            data: allFiles,
          },
        });
      else
        return res.json({
          success: { status: 200, msg: "Bucket has no Files", data: allFiles },
        });
    });
  } catch (err) {
    res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
});

//Get Object/File Api
router.get("/downloadObject", authMiddleware, (req, res) => {
  const { bucketName, fileName } = req.body;
  if (!bucketName || !fileName)
    return res.json({
      error: { status: 404, msg: "Bucket Name and file Name is mandatory" },
    });

  const filePath = path.join(bucketFolder, bucketName, fileName);

  if (!fs.existsSync(filePath))
    return res.json({
      error: {
        status: 400,
        msg: "File not found, Please Enter valid bucketName and fileName",
      },
    });

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Delete Object/File from a particular bucket
router.delete("/deleteObject", authMiddleware, async (req, res) => {
  const { bucketName, fileName } = req.body;
  if (!bucketName || !fileName)
    return res.json({
      error: { status: 404, msg: "Bucket Name and file Name is mandatory" },
    });

  const filePath = path.join(bucketFolder, bucketName, fileName);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
    return res.json({
      error: {
        status: 400,
        msg: "File not found, Please Enter valid bucketName and fileName",
      },
    });

  try {
    fs.unlink(filePath, (err) => {
      if (err)
        return res.json({
          error: { status: 400, msg: "Something went wrong", data: err },
        });
    });

    const file = await objectModel.deleteOne({ fileName });
    return res.json({
      success: {
        status: 200,
        msg: "File deleted successfully",
        data: file,
      },
    });
  } catch (err) {
    return res.json({
      error: { status: 400, msg: "Something went wrong", data: err },
    });
  }
});

// Update existing Object/File with new file
router.put(
  "/updateObject",
  authMiddleware,
  uploadFile().single("file"),
  async (req, res) => {
    const { oldBucketName, oldFileName } = req.body;

    let updatedFilePath;

    try {
      if (req.file) {
        const { destination, filename, mimetype } = req.file;
        updatedFilePath = path.join(destination, filename);
        if (!oldBucketName || !oldFileName)
          throw new Error("old Bucket Name and file Name is mandatory");

        const oldFilePath = path.join(bucketFolder, oldBucketName, oldFileName);
        if (!fs.existsSync(oldFilePath) || !fs.statSync(oldFilePath).isFile()) {
          throw new Error(
            "File not found, Please Enter valid bucketName and fileName"
          );
        }

        fs.unlink(oldFilePath, (err) => {
          if (err)
            return res.json({
              error: { status: 400, msg: "Something went wrong", data: err },
            });
        });
        const uploadedObject = await objectModel.create({
          userId: req.user._id,
          fileName: filename,
          fileType: mimetype,
          path: updatedFilePath,
        });
        await objectModel.deleteOne({ fileName: oldFileName });

        return res.json({
          success: {
            status: 200,
            msg: "File updated successfully",
            data: uploadedObject,
          },
        });
      } else
        return res.json({ error: { status: 404, msg: "File is mandatory" } });
    } catch (e) {
      fs.unlink(updatedFilePath, (err) => {
        if (err)
          return res.json({
            error: { status: 400, msg: "Something went wrong", data: err },
          });
      });
      return res.json({ error: { status: 400, msg: e.message, data: e } });
    }
  }
);

module.exports = router;
