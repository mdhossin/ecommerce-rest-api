import mongoose from "mongoose";

const Schema = mongoose.Schema;

// databse level validation

const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      unique: true,
      // unique: true is user for indexing to find the secarh qurery data fast
    },
  },
  { timestamps: false }
);

export default mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
  "refreshTokens"
);
