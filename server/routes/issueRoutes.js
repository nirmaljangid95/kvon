const express = require('express');
const router = express.Router();
const {
  getIssues,
  getAllIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  searchIssues
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getIssues).post(protect, createIssue);

router.get('/all', protect, getAllIssues);
router.get('/search', protect, searchIssues);

router.route('/:id')
  .get(protect, getIssue)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue);

module.exports = router;
