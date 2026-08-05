import express from 'express';
import { ReviewController } from '../controllers/review.controller.js';

export const reviewRouter = express.Router();
const reviewController = new ReviewController();

reviewRouter.get('/:targetId', (req, res) => {
  return reviewController.listReviews(req, res);
});

reviewRouter.post('/:reviewerId/:targetId', (req, res) => {
  return reviewController.createReview(req, res);
});

reviewRouter.delete('/:reviewerId/:reviewId', (req, res) => {
  return reviewController.deleteReview(req, res);
});
