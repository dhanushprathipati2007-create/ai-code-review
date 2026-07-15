const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
  getDashboardStats,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createReview);
router.get("/", authMiddleware, getReviews);
router.get("/stats/dashboard",  authMiddleware,  getDashboardStats);
router.get("/:id", authMiddleware, getReviewById);
router.delete("/:id",  authMiddleware,  deleteReview);


module.exports = router;