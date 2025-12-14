// Knowledge routes
const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

router.get('/search', knowledgeController.searchArticles);
router.post('/', knowledgeController.createArticle);

module.exports = router;
