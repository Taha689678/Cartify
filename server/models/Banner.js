const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [150, "Banner title cannot exceed 150 characters"],
    },
    image: {
      url: {
        type: String,
        required: [true, "Banner image URL is required"],
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    position: {
      type: String,
      enum: {
        values: ["hero", "featured", "promotion"],
        message: "Position must be hero, featured, or promotion",
      },
      required: [true, "Banner position is required"],
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || !this.startDate || value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      min: [0, "Sort order cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ position: 1, isActive: 1 });
bannerSchema.index({ startDate: 1 });
bannerSchema.index({ endDate: 1 });
bannerSchema.index({ sortOrder: 1 });

module.exports = mongoose.model("Banner", bannerSchema);