const express = require('express');
const mongoose = require('mongoose');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.get('/', async (req, res) => {
  try {
    const { stage } = req.query;
    const filter = stage ? { stage } : {};
    const topics = await Topic.find(filter).lean();
    const formatted = topics.reduce((acc, { _id, stage, topic, subtopic, progress }) => {
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push({ _id, subtopic, progress, stage });
      return acc;
    }, {});
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { stage, topic, subtopic } = req.body;
    await Topic.updateOne(
      { stage, topic, subtopic },
      { stage, topic, subtopic },
      { upsert: true }
    );
    res.status(201).json({ stage, topic, subtopic });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save topic' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { progress, stage, topic, subtopic } = req.body;
    const update = {};
    if (progress !== undefined) update.progress = progress;
    if (stage !== undefined) update.stage = stage;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;
    const topicDoc = await Topic.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(topicDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

module.exports = router;
