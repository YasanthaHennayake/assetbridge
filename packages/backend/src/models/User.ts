/**
 * User Model
 *
 * Mongoose schema and model for User documents in MongoDB.
 * This model defines the structure, validation rules, and indexes
 * for user data in the AssetBridge system.
 *
 * Key Features:
 * - Unique email index for fast lookups and preventing duplicates
 * - Timestamps for audit trail (createdAt, updatedAt)
 * - Password field (stores hashed passwords only)
 * - mustChangePassword flag for first-time login flow
 * - lastLogin timestamp for tracking user activity
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { User as IUser } from '@assetbridge/shared';

/**
 * User Document Interface
 *
 * Extends the shared User interface with Mongoose Document methods.
 * This provides both type safety and Mongoose functionality.
 */
export interface UserDocument extends Omit<IUser, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * User Schema Definition
 *
 * Defines the structure and validation rules for user documents.
 */
const userSchema = new Schema<UserDocument>(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // Email address - used as login identifier
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    // Hashed password (never store plain text passwords)
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },

    // Flag indicating if user must change password on next login
    // Set to true when admin creates a new user with generated password
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    // Last login timestamp for tracking user activity
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,

    // Customize JSON output (remove password, rename _id to id)
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Never include password in JSON output
        return ret;
      },
    },
  }
);

/**
 * Indexes
 *
 * Creating indexes improves query performance and enforces constraints.
 */

// Unique index on email (prevents duplicate emails, speeds up login queries)
userSchema.index({ email: 1 }, { unique: true });

// Index on createdAt for sorting and filtering by creation date
userSchema.index({ createdAt: 1 });

// Index on lastLogin for activity tracking queries
userSchema.index({ lastLogin: 1 });

/**
 * User Model
 *
 * Export the Mongoose model for use in controllers and services.
 */
const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
