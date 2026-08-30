import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Seller from "../models/Seller.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

export const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const avg = result.length > 0 ? result[0].avgRating : 0;
  const count = result.length > 0 ? result[0].numReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avg,
    numReviews: count,
  });
};

export const checkEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));

    if (req.user.role === "seller") {
      const seller = await Seller.findOne({ user: userId });
      if (seller && product.seller.toString() === seller._id.toString()) {
        return res
          .status(200)
          .json(new ApiResponse(200, "Eligibility checked", { eligible: false }));
      }
    }

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    
    if (existingReview) {
      return res.status(200).json(
        new ApiResponse(200, "Eligibility checked", {
          eligible: false,
          existingReview,
        })
      );
    }

    const order = await Order.findOne({
      user: userId,
      orderStatus: "delivered",
      "items.product": productId,
    });

    if (order) {
      return res.status(200).json(
        new ApiResponse(200, "Eligibility checked", {
          eligible: true,
          orderId: order._id,
        })
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Eligibility checked", { eligible: false }));
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) return next(new ApiError(404, "Product not found"));

    if (req.user.role === "seller") {
      const seller = await Seller.findOne({ user: userId });
      if (seller && product.seller.toString() === seller._id.toString()) {
        return next(new ApiError(403, "You cannot review your own product"));
      }
    }

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    
    if (existingReview) {
      return next(new ApiError(409, "Review already exists"));
    }

    const order = await Order.findOne({
      user: userId,
      orderStatus: "delivered",
      "items.product": productId,
    });

    if (!order) {
      return next(
        new ApiError(
          403,
          "You must have purchased and received this product to review it"
        )
      );
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      order: order._id,
      rating,
      title,
      comment,
    });

    await updateProductRating(productId);

    return res.status(201).json(new ApiResponse(201, "Review created", review));
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    return res.status(200).json(
      new ApiResponse(200, "Reviews fetched", {
        reviews,
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) return next(new ApiError(404, "Review not found"));

    if (review.user.toString() !== userId) {
      return next(new ApiError(403, "Not authorized to update this review"));
    }

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await updateProductRating(review.product);

    return res.status(200).json(new ApiResponse(200, "Review updated", review));
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) return next(new ApiError(404, "Review not found"));

    if (review.user.toString() !== userId) {
      return next(new ApiError(403, "Not authorized to delete this review"));
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    return res.status(200).json(new ApiResponse(200, "Review deleted"));
  } catch (error) {
    next(error);
  }
};
