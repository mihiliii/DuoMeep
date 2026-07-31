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

reviewRouter.get('/:reviewerId/:targetId', (req, res) => {
  return reviewController.getReview(req, res);
});

reviewRouter.put('/:reviewerId/:targetId', (req, res) => {
  return reviewController.updateReview(req, res);
});

reviewRouter.delete('/:reviewerId/:targetId', (req, res) => {
  return reviewController.deleteReview(req, res);
});
