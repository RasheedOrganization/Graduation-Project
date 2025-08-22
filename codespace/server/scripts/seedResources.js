require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../model/resourceModel');
const Topic = require('../model/topicModel');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

const resources = [
  { name: 'BFS Tutorial', link: 'https://example.com/bfs', topic: 'Graph Algorithms', subtopic: 'BFS', status: 'Not Attempted' },
  { name: 'DFS Guide', link: 'https://example.com/dfs', topic: 'Graph Algorithms', subtopic: 'DFS', status: 'Solving' },
  { name: 'Knapsack Article', link: 'https://example.com/knapsack', topic: 'Dynamic Programming', subtopic: 'Knapsack', status: 'Solved' },
  { name: 'LIS Explained', link: 'https://example.com/lis', topic: 'Dynamic Programming', subtopic: 'LIS', status: 'Reviewing' }
];

async function seed() {
  try {
    await mongoose.connect(url);
    await Resource.deleteMany({});
    await Topic.deleteMany({});
    await Resource.insertMany(resources);

    // Seed unique topic/subtopic pairs
    const topicOps = resources.map(({ topic, subtopic }) => ({ topic, subtopic }));
    await Topic.insertMany(topicOps, { ordered: false }).catch(() => {});

    console.log('Resources seeded');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
