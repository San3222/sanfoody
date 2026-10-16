import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  emoji: string;
  image: string;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: [true, "Emoji is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);