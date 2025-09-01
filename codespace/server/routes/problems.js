const express = require('express');
const mongoose = require('mongoose');
const Problem = require('../model/practiceProblemModel');
const Topic = require('../model/topicModel');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/roleMiddleware');

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
    const { stage, topic, subtopic } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;
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

router.post('/', auth, permit('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, link, stage, topic, subtopic, difficulty, status } = req.body;
    const domain = getDomain(link);
    const problem = new Problem({ name, link, stage, topic, subtopic, difficulty, domain, status });
    await problem.save();

    await Topic.updateOne(
      { stage, topic, subtopic },
      { stage, topic, subtopic },
      { upsert: true }
    );

    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

router.patch('/:id', auth, permit('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, link, stage, topic, subtopic, difficulty, status } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (link !== undefined) {
      update.link = link;
      update.domain = getDomain(link);
    }
    if (stage !== undefined) update.stage = stage;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;
    if (difficulty !== undefined) update.difficulty = difficulty;
    if (status !== undefined) update.status = status;

    const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true });

    if (problem && (update.stage !== undefined || update.topic !== undefined || update.subtopic !== undefined)) {
      await Topic.updateOne(
        { stage: problem.stage, topic: problem.topic, subtopic: problem.subtopic },
        { stage: problem.stage, topic: problem.topic, subtopic: problem.subtopic },
        { upsert: true }
      );
    }

    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

module.exports = router;
