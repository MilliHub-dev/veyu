import Reel from "../models/reel.js";

export const uploadReel = async (req, res) => {
  const { description, vehicleType } = req.body;
  const videoUrl = req.file?.path;

  const reel = new Reel({
    user: req.user.id,
    videoUrl,
    description,
    vehicleType,
  });

  await reel.save();
  res.status(201).json(reel);
};

export const getReels = async (req, res) => {
  const reels = await Reel.find().sort({ createdAt: -1 });
  res.json(reels);
};

// Admin or owner can delete
export const deleteReel = async (req, res) => {
  const reel = await Reel.findById(req.params.id);

  if (!reel) return res.status(404).json({ message: "Reel not found" });

  // Only admin or the owner can delete
  if (req.user.id !== reel.user && !req.user.is_admin) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await reel.deleteOne();
  res.json({ message: "Reel deleted successfully" });
};

// Like or Unlike a reel
export const toggleLike = async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ message: "Reel not found" });

  const userId = req.user.id;
  const index = reel.likes.indexOf(userId);

  if (index === -1) {
    reel.likes.push(userId); // Like
  } else {
    reel.likes.splice(index, 1); // Unlike
  }

  await reel.save();
  res.json({ likes: reel.likes.length });
};

//  Add a comment
export const addComment = async (req, res) => {
  const { text } = req.body;
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ message: "Reel not found" });

  const comment = {
    user: req.user.id,
    username: req.user.username, // if included in JWT
    text,
  };

  reel.comments.push(comment);
  await reel.save();
  res.status(201).json({ comments: reel.comments });
};

//  Get all comments for a reel
export const getComments = async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ message: "Reel not found" });

  res.json({ comments: reel.comments });
};