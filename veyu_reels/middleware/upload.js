import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../uploads/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vehicle-reels",
    resource_type: "video",
  },
});

const upload = multer({ storage });

export default upload;
