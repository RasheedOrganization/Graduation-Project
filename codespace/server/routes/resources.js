const express = require('express');
const mongoose = require('mongoose');
const Resource = require('../model/resourceModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, link, topic, subtopic } = req.body;
    const resource = new Resource({ name, link, topic, subtopic });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status, name, link, topic, subtopic } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (name !== undefined) update.name = name;
    if (link !== undefined) update.link = link;
    if (topic !== undefined) update.topic = topic;
    if (subtopic !== undefined) update.subtopic = subtopic;

    const resource = await Resource.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

module.exports = router;
