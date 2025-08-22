const express = require('express');
const mongoose = require('mongoose');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find();
    const formatted = topics.reduce((acc, { topic, subtopic }) => {
      if (!acc[topic]) acc[topic] = [];
      if (subtopic) acc[topic].push(subtopic);
      return acc;
    }, {});
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { topic, subtopic } = req.body;
    await Topic.updateOne(
      { topic, subtopic },
      { topic, subtopic },
      { upsert: true }
    );
    res.status(201).json({ topic, subtopic });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save topic' });
  }
});

module.exports = router;
