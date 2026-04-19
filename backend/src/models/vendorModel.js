import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        // Only required for manual signup, not Google login
        return !this.googleId;
      },
      default: "",
    },
    contact_number: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if not using Google login
        return !this.googleId;
      },
    },
    store_name: {
      type: String,
      // NOT unique — Google users start with empty store_name, which would
      // cause E11000 duplicate key errors if multiple Google vendors are created.
      // Store names are enforced to be unique at the application level instead.
      required: function () {
        return !this.googleId;
      },
      default: "",
    },
    store_location: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Google Login Fields
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    isGoogleLogin: {
      type: Boolean,
      default: false,
    },
    auto_confirm_orders: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // Prevent double-hashing when a controller already provided bcrypt output.
  if (/^\$2[aby]\$\d{2}\$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// matchPassword method
vendorSchema.methods.matchPassword = async function (enteredPassword) {
  // If user is Google login only and doesn't have password, return false
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

vendorSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
