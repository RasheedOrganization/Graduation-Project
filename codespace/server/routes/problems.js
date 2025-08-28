const express = require('express');
const mongoose = require('mongoose');
const Problem = require('../model/practiceProblemModel');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

const getDomain = (link) => {
  try {
    const url = new URL(link.startsWith('http') ? link : `https://${link}`);
    return url.hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return '';
  }
};

router.get('/', async (req, res) => {
  try {
    const { level, topic, subtopic } = req.query;
    const filter = {};
    if (level) filter.level = level;
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    const problems = await Problem.find(filter);
    const withDomains = problems.map((p) => {
      const obj = p.toObject();
      if (!obj.domain) {
        obj.domain = getDomain(obj.link);
      }
      return obj;
    });
    res.json(withDomains);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, link, level, topic, subtopic, difficulty } = req.body;
    const domain = getDomain(link);
    const problem = new Problem({ name, link, level, topic, subtopic, difficulty, domain });
    await problem.save();

    await Topic.updateOne(
      { level, topic, subtopic },
      { level, topic, subtopic },
      { upsert: true }
    );

    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, link, level, topic, subtopic, difficulty } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (link !== undefined) {
      update.link = link;
      update.domain = getDomain(link);
    }
    if (level !== undefined) update.level = level;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;
    if (difficulty !== undefined) update.difficulty = difficulty;

    const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (problem && (update.level !== undefined || update.topic !== undefined || update.subtopic !== undefined)) {
      await Topic.updateOne(
        { level: problem.level, topic: problem.topic, subtopic: problem.subtopic },
        { level: problem.level, topic: problem.topic, subtopic: problem.subtopic },
        { upsert: true }
      );
    }

    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

module.exports = router;
