import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
  },
  icon: {
    type: String,
  },
}, {
  timestamps: true
});

const media = mongoose.model('media', mediaSchema);

export default media;
