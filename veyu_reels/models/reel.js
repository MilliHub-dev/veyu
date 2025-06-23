import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: String,             // User ID
  username: String,         // display name
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const reelSchema = new mongoose.Schema({
  user: { type: String, required: true }, // uploader
  videoUrl: String,
  description: String,
  vehicleType: String,
  likes: [String], // array of user IDs
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Reel = mongoose.model("Reel", reelSchema);
export default Reel;
