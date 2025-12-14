// Knowledge controller
const KnowledgeBaseArticle = require('../models/KnowledgeBaseArticle');
const connectDB = require('../../shared/db');

connectDB();

exports.createArticle = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }
    const article = new KnowledgeBaseArticle({ title, content, tags });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create article.' });
  }
};

exports.searchArticles = async (req, res) => {
  try {
    const { q } = req.query;
    const query = q ? { $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ] } : {};
    const articles = await KnowledgeBaseArticle.find(query);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search articles.' });
  }
};
