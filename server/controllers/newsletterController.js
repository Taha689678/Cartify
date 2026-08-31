import Newsletter from "../models/Newsletter.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    let subscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    
    if (subscriber) {
      if (!subscriber.isActive) {
        subscriber.isActive = true;
        await subscriber.save();
      }
      return successResponse(res, 200, "Successfully subscribed!");
    }

    subscriber = new Newsletter({ email });
    await subscriber.save();

    return successResponse(res, 201, "Successfully subscribed!");
  } catch (error) {
    next(error);
  }
};