import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bio: { type: String },
  imageUrl: { type: String },
  interests: [{ type: String }],
});

const SwipeSchema = new Schema({
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  direction: { type: String, enum: ['left', 'right'], required: true },
  createdAt: { type: Date, default: Date.now },
});
SwipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const MatchSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
export const Swipe = mongoose.models.Swipe || mongoose.model('Swipe', SwipeSchema);
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/heartsync';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');
};
