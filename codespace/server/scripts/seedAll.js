require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../model/userModel');
const PracticeProblem = require('../model/practiceProblemModel');
const Problem = require('../model/problemModel');
const Resource = require('../model/resourceModel');
const Topic = require('../model/topicModel');
const Contest = require('../model/contestModel');
const Room = require('../model/roomModel');
const Message = require('../model/messageModel');
const RoomUser = require('../model/roomUserModel');
const Submission = require('../model/submissionModel');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

async function seedIfEmpty(Model, data) {
  const count = await Model.countDocuments();
  if (count === 0) {
    await Model.insertMany(data);
    console.log(`Seeded ${Model.modelName}`);
  } else {
    console.log(`${Model.modelName} already has data, skipping`);
  }
}

async function main() {
  await mongoose.connect(url);

  // Users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash('password', 10);
    users.push({
      username: `user${i}`,
      email: `user${i}@example.com`,
      password,
      displayName: `User ${i}`,
    });
  }
  await seedIfEmpty(User, users);

  // Practice Problems
  const stages = ['Bronze', 'Silver', 'Gold'];
  const practiceProblems = Array.from({ length: 10 }).map((_, i) => ({
    name: `Practice Problem ${i + 1}`,
    link: `https://example.com/practice${i + 1}`,
    stage: stages[i % stages.length],
    topic: `Topic ${i + 1}`,
    subtopic: `Subtopic ${i + 1}`,
    difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
    domain: 'General',
  }));
  await seedIfEmpty(PracticeProblem, practiceProblems);

  // Problems
  const problems = Array.from({ length: 10 }).map((_, i) => ({
    problem_name: `Problem ${i + 1}`,
    statement: `Statement for problem ${i + 1}`,
    sinput: `Input ${i + 1}`,
    soutput: `Output ${i + 1}`,
  }));
  await seedIfEmpty(Problem, problems);

  // Resources and Topics
  const resources = Array.from({ length: 10 }).map((_, i) => ({
    name: `Resource ${i + 1}`,
    link: `https://example.com/resource${i + 1}`,
    stage: stages[i % stages.length],
    topic: `Topic ${i + 1}`,
    subtopic: `Subtopic ${i + 1}`,
    status: 'Not Attempted',
  }));
  await seedIfEmpty(Resource, resources);

  const topics = resources.map((r) => ({
    stage: r.stage,
    topic: r.topic,
    subtopic: r.subtopic,
  }));
  await seedIfEmpty(Topic, topics);

  // Contests
  const contests = Array.from({ length: 10 }).map((_, i) => ({
    name: `Contest ${i + 1}`,
    startTime: new Date(Date.now() + i * 3600 * 1000),
    duration: 60,
    problems: [],
    participants: [],
  }));
  await seedIfEmpty(Contest, contests);

  // Rooms
  const rooms = Array.from({ length: 10 }).map((_, i) => ({
    roomid: `${1000 + i}`,
    isPrivate: false,
  }));
  await seedIfEmpty(Room, rooms);

  const firstUser = await User.findOne();
  const firstRoom = await Room.findOne();

  // Messages
  if (firstUser && firstRoom) {
    const messages = Array.from({ length: 10 }).map((_, i) => ({
      room: firstRoom._id,
      roomid: firstRoom.roomid,
      userid: firstUser.id,
      username: firstUser.username,
      message: `Message ${i + 1}`,
    }));
    await seedIfEmpty(Message, messages);
  } else {
    console.log('Skipping Message seeding due to missing user or room');
  }

  // Room Users
  if (firstUser && firstRoom) {
    const roomUsers = Array.from({ length: 10 }).map((_, i) => ({
      roomid: firstRoom.roomid,
      userid: `${firstUser.id}-${i}`,
      username: `${firstUser.username}${i}`,
      micOn: false,
    }));
    await seedIfEmpty(RoomUser, roomUsers);
  } else {
    console.log('Skipping RoomUser seeding due to missing user or room');
  }

  // Submissions
  if (firstUser) {
    const submissions = Array.from({ length: 10 }).map((_, i) => ({
      user: firstUser._id,
      problem: `Problem ${i + 1}`,
      code: '#include <iostream>\nint main(){return 0;}',
      verdict: 'AC',
      language: 'C++',
    }));
    await seedIfEmpty(Submission, submissions);
  } else {
    console.log('Skipping Submission seeding due to missing user');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
