const express = require('express');
const mongoose = require('mongoose');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

// Get all topics grouped with their subtopics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find();
    const grouped = {};
    topics.forEach(({ topic, subtopic }) => {
      if (!grouped[topic]) grouped[topic] = [];
      if (subtopic) grouped[topic].push(subtopic);
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Add a topic or subtopic
router.post('/', async (req, res) => {
  try {
    const { topic, subtopic = '' } = req.body;
    const newTopic = new Topic({ topic, subtopic });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Topic and subtopic already exist' });
    } else {
      res.status(500).json({ error: 'Failed to save topic' });
    }
  }
});

module.exports = router;
