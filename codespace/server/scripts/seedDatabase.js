require("dotenv").config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const Contest = require('../model/contestModel');
const Message = require('../model/messageModel');
const Problem = require('../model/problemModel');
const PracticeProblem = require('../model/practiceProblemModel');
const Resource = require('../model/resourceModel');
const Room = require('../model/roomModel');
const RoomUser = require('../model/roomUserModel');
const Submission = require('../model/submissionModel');
const Topic = require('../model/topicModel');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

async function seed() {
  await mongoose.connect(url);

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('Database already seeded');
    await mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash('password', 10);
  const usersData = [];
  for (let i = 0; i < 10; i++) {
    let role = 'user';
    if (i === 8) role = 'admin';
    if (i === 9) role = 'superadmin';
    usersData.push({
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      password,
      role,
      displayName: `User ${i + 1}`,
    });
  }
  const users = await User.insertMany(usersData);

  const stages = ['Bronze', 'Silver', 'Gold'];

  const topics = [];
  for (let i = 0; i < 10; i++) {
    topics.push({
      stage: stages[i % 3],
      topic: `Topic ${Math.floor(i / 3) + 1}`,
      subtopic: `Subtopic ${i + 1}`,
      progress: ['not started', 'reading', 'finished'][i % 3],
    });
  }
  await Topic.insertMany(topics);

  const practiceProblems = [];
  for (let i = 0; i < 10; i++) {
    practiceProblems.push({
      name: `Practice Problem ${i + 1}`,
      link: `https://example.com/practice/${i + 1}`,
      stage: stages[i % 3],
      topic: `Topic ${Math.floor(i / 3) + 1}`,
      subtopic: `Subtopic ${i + 1}`,
      difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
      domain: `Domain ${i % 2 + 1}`,
      status: ['Not Attempted', 'Attempted', 'Solved'][i % 3],
    });
  }
  const practiceDocs = await PracticeProblem.insertMany(practiceProblems);

  const resources = [];
  for (let i = 0; i < 10; i++) {
    resources.push({
      name: `Resource ${i + 1}`,
      link: `https://example.com/resource/${i + 1}`,
      stage: stages[i % 3],
      topic: `Topic ${Math.floor(i / 3) + 1}`,
      subtopic: `Subtopic ${i + 1}`,
      status: ['Not Attempted', 'In Progress', 'Completed'][i % 3],
    });
  }
  await Resource.insertMany(resources);

  const problems = [];
  for (let i = 0; i < 10; i++) {
    problems.push({
      problem_name: `Problem ${i + 1}`,
      statement: `Solve problem ${i + 1}`,
      sinput: `Input ${i + 1}`,
      soutput: `Output ${i + 1}`,
    });
  }
  const problemDocs = await Problem.insertMany(problems);

  const contests = [];
  for (let i = 0; i < 10; i++) {
    contests.push({
      name: `Contest ${i + 1}`,
      startTime: new Date(Date.now() + i * 3600 * 1000),
      duration: 90 + i,
      status: ['upcoming', 'running', 'finished'][i % 3],
      problems: problemDocs.slice(i % problemDocs.length, (i % problemDocs.length) + 3).map(p => p._id.toString()),
      participants: users.slice(0, 5).map(u => u._id),
    });
  }
  await Contest.insertMany(contests);

  const rooms = [];
  for (let i = 0; i < 10; i++) {
    rooms.push({
      roomid: (1000 + i).toString(),
      isPrivate: i % 2 === 0,
      password: i % 2 === 0 ? `pass${i}` : undefined,
    });
  }
  const roomDocs = await Room.insertMany(rooms);

  const roomUsers = [];
  for (let i = 0; i < 10; i++) {
    const room = roomDocs[i % roomDocs.length];
    const user = users[i % users.length];
    roomUsers.push({
      roomid: room.roomid,
      userid: user._id.toString(),
      username: user.username,
      micOn: i % 2 === 0,
    });
  }
  await RoomUser.insertMany(roomUsers);

  const messages = [];
  for (let i = 0; i < 10; i++) {
    const room = roomDocs[i % roomDocs.length];
    const user = users[i % users.length];
    messages.push({
      room: room._id,
      roomid: room.roomid,
      userid: user._id.toString(),
      username: user.username,
      message: `Hello from ${user.username} in room ${room.roomid}`,
    });
  }
  await Message.insertMany(messages);

  const submissions = [];
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    submissions.push({
      user: user._id,
      problem: practiceDocs[i % practiceDocs.length].name,
      code: `// solution ${i + 1}`,
      verdict: ['AC', 'WA', 'TLE'][i % 3],
      language: ['cpp', 'python', 'java'][i % 3],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    });
  }
  await Submission.insertMany(submissions);

  console.log('Database seeded');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  mongoose.disconnect();
});
