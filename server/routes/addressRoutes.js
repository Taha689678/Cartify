import { Router } from "express";
import requireAuth from "../middleware/authMiddleware.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

const router = Router();

// Protect all address routes
router.use(requireAuth);

router.get("/", getAddresses);
router.post("/", createAddress);
router.patch("/:id/default", setDefaultAddress); // must come before /:id
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
