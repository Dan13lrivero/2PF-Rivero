import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    lastServiceDate: {
      type: Date,
    },
    serviceDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
