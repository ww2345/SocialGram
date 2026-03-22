const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

PostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
