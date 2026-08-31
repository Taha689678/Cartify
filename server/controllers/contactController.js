import Contact from "../models/Contact.js";
import emailService from "../services/emailService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return errorResponse(res, 400, "All fields are required");
    }

    // Save contact message to database
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await contact.save();

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation({
        name,
        email,
        subject,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the entire request if email fails
    }

    return successResponse(
      res,
      201,
      "Your message has been received. We'll get back to you soon!",
      { contactId: contact._id }
    );
  } catch (error) {
    next(error);
  }
};
