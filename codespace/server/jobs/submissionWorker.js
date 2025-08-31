require("dotenv").config();
const {Job, Queue, Worker, QueueEvents} = require('bullmq')
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker();

// Allow configuration of the Redis connection while providing sensible defaults
const { hostname: redisHost, port: redisPort } = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
const connectionOptions = {
    host: redisHost,
    port: parseInt(redisPort, 10)
};

// allow configuration of backend URL
const targetRouteUrl = `${process.env.BACKEND_URL || 'http://localhost:6909'}/api/get-test-package`;
const submissionQueue = new Queue('submissionProcess',{connection: connectionOptions});

async function getTestPackageData(problem_id) {
    try {
      const response = await fetch(targetRouteUrl, {
        method: 'POST',
        body: JSON.stringify({ id: problem_id }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
}

function changeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, data, 'utf8');
      console.log(`File content at ${filePath} has been updated.`);
    } catch (err) {
      console.error('Error writing the file:', err);
      throw err;
    }
}

async function runContainer(containerOptions) {
    try {
        const container = await docker.createContainer(containerOptions);
        await container.start();
        console.log('Container started successfully.');
        await container.wait();
        await container.remove();
        console.log('Container finished.');
    } catch (err) {
        console.error('Error during Docker container operation:', err);
        throw err;
    }
}

async function submissionWorker(job) {
    console.log("Anyone homeeee?")
    // creates a whole new folder for this thing
    const reqId = job.id;
    const folderPath = path.join(__dirname,'..','routes','test1',reqId);

    return new Promise((resolve, reject) => {
        fs.mkdir(folderPath, { recursive: true }, async (err) => {
            if (err) {
                reject(`Error: ${err.message}`);
                console.error(err);
                return;
            }
    
            console.log("Folder created!");
    
            try {
                // The request has a problem ID and the code
                const { code, problemId, language = 'cpp' } = job.data;
                // Get the test package
                const testPackage = await getTestPackageData(problemId);
                console.log("test package is",testPackage);
                // Define file paths
                const sourceName = language === 'python' ? 'a.py' : 'a.cpp';
                const sourcefilepath = path.join(folderPath, sourceName);
                const inputfilepath = path.join(folderPath, 'input.txt');
                const expectedoutputpath = path.join(folderPath, 'expected_output.txt');
                const verdictfilepath = path.join(folderPath, 'verdict.txt');
                const outputfilepath = path.join(folderPath, 'output.txt');
                const test_path = path.join(folderPath);
                const { expected_output, main_tests } = testPackage;

                // Change files
                await changeFile(inputfilepath, main_tests);
                await changeFile(expectedoutputpath, expected_output);
                await changeFile(sourcefilepath, code);
                await changeFile(verdictfilepath, ''); // Create empty file
                console.log('Files changed!');

                let verdictData;
                if (language === 'python') {
                    const containerOptions = {
                        Image: 'python:3',
                        Cmd: ['bash', '-lc', 'python3 a.py < input.txt > output.txt'],
                        HostConfig: {
                            Memory: 256 * 1024 * 1024,
                            PidsLimit: 100,
                            Binds: [`${test_path}:/contest/`],
                            NetworkMode: 'none',
                        }
                    };

                    await runContainer({ ...containerOptions, WorkingDir: '/contest' });

                    const userOutput = fs.readFileSync(outputfilepath, 'utf8');
                    const expected = fs.readFileSync(expectedoutputpath, 'utf8');
                    verdictData = userOutput.trim() === expected.trim() ? 'Accepted' : 'Wrong Answer';
                    await changeFile(verdictfilepath, verdictData);
                } else {
                    const containerOptions = {
                        Image: 'nubskr/compiler:1',
                        Cmd: ['./doshit.sh'],
                        WorkingDir: '/contest',
                        HostConfig: {
                            Memory: 256 * 1024 * 1024, // 256MB
                            PidsLimit: 100, // Limit number of processes
                            Binds: [`${test_path}:/contest/`],
                            NetworkMode: 'none',
                        }
                    };

                    await runContainer(containerOptions);
                    verdictData = fs.readFileSync(verdictfilepath, 'utf8');
                }

                console.log(verdictData);
                resolve(verdictData);
            } catch (err) {
                reject(`Error: ${err.message}`);
                console.error(err);
            }
        });
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
          reject(failedReason);
        }
      }
      queueEvents.on("completed",completedHandler);
      queueEvents.on("failed",failedHandler);
    })
  }

const worker = new Worker('submissionProcess',submissionWorker,{
  connection: connectionOptions,
  // Default to a single worker if the environment variable is undefined or invalid
  concurrency: parseInt(process.env.CONCURRENT_SUBMISSION_WORKERS, 10) || 1
});

module.exports = {submissionQueue, submissionWorker: worker, waitforJobCompletion};
