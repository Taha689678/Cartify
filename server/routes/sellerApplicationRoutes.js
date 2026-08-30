import express from "express";
import { submitApplication, getMyApplication } from "../controllers/sellerApplicationController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", submitApplication);
router.get("/me", getMyApplication);

export default router;
