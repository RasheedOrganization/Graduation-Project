const express = require('express');
const mongoose = require('mongoose');
const Resource = require('../model/resourceModel');
const Topic = require('../model/topicModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.get('/', async (req, res) => {
  try {
    const { stage, topic, subtopic } = req.query;
    const filter = {};
    if (stage) filter.stage = stage;
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    const resources = await Resource.find(filter);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, link, stage, topic, subtopic } = req.body;
    const resource = new Resource({ name, link, stage, topic, subtopic });
    await resource.save();

    await Topic.updateOne(
      { stage, topic, subtopic },
      { stage, topic, subtopic },
      { upsert: true }
    );

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status, name, link, stage, topic, subtopic } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (name !== undefined) update.name = name;
    if (link !== undefined) update.link = link;
    if (stage !== undefined) update.stage = stage;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;

    const resource = await Resource.findByIdAndUpdate(req.params.id, update, { new: true });

    if (resource && (update.stage !== undefined || update.topic !== undefined || update.subtopic !== undefined)) {
      await Topic.updateOne(
        { stage: resource.stage, topic: resource.topic, subtopic: resource.subtopic },
        { stage: resource.stage, topic: resource.topic, subtopic: resource.subtopic },
        { upsert: true }
      );
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

module.exports = router;
