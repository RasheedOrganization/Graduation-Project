const express = require('express')
const mongoose = require('mongoose');
const router = express.Router();
// Use provided MongoDB connection string or fall back to a local instance
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';
const {QueueEvents} = require('bullmq');
const { redisClient } = require('../model/redisModel');
const {scrapingQueue} = require('../jobs/webScrapingWorker')
const { saveFile, getTestData } = require('../controllers/fileStorage');
const expire_time = 3600;

const ProblemSchema = new mongoose.Schema({
  id: String,
  problem_name:  String,
  statement:  String,
  sinput: String,
  soutput: String,
});

const testsSchema = new mongoose.Schema({
  id: String,
  main_tests: String,
  expected_output: String,
});

const problem_model = mongoose.model('Problem Packages',ProblemSchema);
// const tests_model = mongoose.model('Test Packages',testsSchema);
mongoose.connect(url).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

function newProblem(data){
  const {
    id,
    problem_name,
    statement,
    sinput,
    soutput,
    main_tests,
    expected_output,
  } = data;

  const problem_package = new problem_model({
    id,
    problem_name,
    statement,
    sinput,
    soutput,
  });

  // const tests_package = new tests_model({
  //   id,
  //   main_tests,
  //   expected_output,
  // });

  problem_package.save()
  .then(() => {
    console.log('problem_package saved successfully');
  })
  .catch(error => {
    console.error('Error saving problem_package:', error.message);
  });

  
}

function waitforJobCompletion(queue,job){
  // checks the status
  const queueEvents = new QueueEvents(queue.name);
  return new Promise(function(resolve,reject){
    function completedHandler({jobId,returnvalue}) {
      console.log("something passed");
      if(jobId === job.id){
        // console.log("we done ????");
        // console.log(returnvalue);
        // our work is done here, remove the event listeners
        queueEvents.off('completed', completedHandler);
        queueEvents.off('failed', failedHandler);
        resolve(returnvalue);
      }
    }

    function failedHandler({jobId,failedReason}) {
      // console.log("something failed");
      if(jobId === job.id){
        queueEvents.off('completed', completedHandler);
        queueEvents.off('failed', failedHandler);
        reject(new Error("Job error"));
      }
    }
    queueEvents.on("completed",completedHandler);
    queueEvents.on("failed",failedHandler);
  })
}

async function getProblemList(){
  try{
    const data = await problem_model.find({});
    return data;
  }
  catch(error){
    return error;
  }
}

router.get('/', (req, res) => {
  console.log('someone came');
  res.send('Hi');
});

router.post('/new', async (req,res) => {
  try{
    if (redisClient.isOpen) {
      await redisClient.flushAll();
    }
    newProblem(req.body);
    const { id, main_tests, expected_output } = req.body;
    // store test data locally
    saveFile(`${id}`, 'input.txt', main_tests);
    saveFile(`${id}`, 'output.txt', expected_output);
  }
  catch(error){
    console.error(error);
  }

})

router.get('/problem-list',async (req,res) => {
  try{
    let data;
    if (redisClient.isOpen) {
      data = await redisClient.get("problem-list");
    }
    if(!data){
      console.log("We don't have that cached sire");
      data = await getProblemList();
      console.log(data);
      // cache the problems now
      if (redisClient.isOpen) {
        await redisClient.set("problem-list",JSON.stringify(data));
      }
      res.send(data);
    }
    else{
      console.log("On it sire! UwU");
      data = JSON.parse(data);
      res.send(data);
    }
  }
  catch(error){
    console.error(error);
    res.status(500).send("sowwie,error fetching problems");
  }
})

router.get('/parse_problem/:param',async (req,res) => {
  console.log("who called me");
  // console.log(redisClient);
  
  const req_problem = decodeURIComponent(req.params.param);
  var data = null;
  if (redisClient.isOpen) {
    data = await redisClient.get(req_problem);
  }
  console.log(data);
  if(data!==null){
    res.json(JSON.parse(data));
  }
  else{
    // let the worker do it!!
    const job = await scrapingQueue.add('scrapingProcess',req_problem);
    console.log("added to queue");
    try{
      const result = await waitforJobCompletion(scrapingQueue,job);
      res.json(result);
    }
    catch(err){
      console.error(err);
      res.json({error: "Invalid link!"});
      // send everything empty ?
    }
    
  }


})

router.post('/get-test-package', async (req,res) => {
  const {id} = req.body;
  // needs to return a nice json!
  // so we get data from bucket and make it a json!
  try{
    var data = null;
    if (redisClient.isOpen) {
      data = await redisClient.get(id);
    }
    if(data===null){
      console.log("We don't have that cached sire");
      // I hope memory does not blow up with caching big tests bruh!

      data = await getTestData(id);

      // cache the problems now
      if (redisClient.isOpen) {
        await redisClient.setEx(id,expire_time,JSON.stringify(data));
      }
      res.json(data);
    }
    else{
      console.log("On it sire! UwU");
      data = JSON.parse(data);
      res.json(data);
    }
  }
  catch(error){
    console.error(error);
  }
})


module.exports = router;


