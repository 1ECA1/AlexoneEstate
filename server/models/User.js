
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        validator.isEmail,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // User role and account status
    role: {
      type: String,
      enum: ["customer", "agent", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Agent profile photo
    profilePhotoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    profilePhotoPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    // Agent professional information
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        120,
        "Location cannot exceed 120 characters",
      ],
    },

    specialty: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        100,
        "Specialty cannot exceed 100 characters",
      ],
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
      max: [70, "Experience cannot exceed 70 years"],
      validate: {
        validator: Number.isInteger,
        message: "Years of experience must be a whole number",
      },
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [
        1000,
        "Bio cannot exceed 1000 characters",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Hash passwords before saving.
// Existing passwords are not re-hashed unless changed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare a login password with the stored password hash.
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Export the User model.
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
