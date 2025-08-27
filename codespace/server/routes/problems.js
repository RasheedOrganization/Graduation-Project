const express = require('express');
const mongoose = require('mongoose');
const Problem = require('../model/practiceProblemModel');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, link, topic, subtopic, difficulty } = req.body;
    const problem = new Problem({ name, link, topic, subtopic, difficulty });
    await problem.save();

    await Topic.updateOne(
      { topic, subtopic },
      { topic, subtopic },
      { upsert: true }
    );

    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, link, topic, subtopic, difficulty } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (link !== undefined) update.link = link;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;
    if (difficulty !== undefined) update.difficulty = difficulty;

    const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (problem && (update.topic !== undefined || update.subtopic !== undefined)) {
      await Topic.updateOne(
        { topic: problem.topic, subtopic: problem.subtopic },
        { topic: problem.topic, subtopic: problem.subtopic },
        { upsert: true }
      );
    }

    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

module.exports = router;
