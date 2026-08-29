import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/userController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all user routes
router.use(requireAuth);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
