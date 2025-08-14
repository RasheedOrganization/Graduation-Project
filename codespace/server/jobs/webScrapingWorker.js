const {Job, Queue, Worker} = require('bullmq')
const {redisClient} = require('../model/redisModel')
const {exec} = require('child_process');
const { stderr } = require('process');

require('dotenv').config();

// Allow configuration of the Redis connection while providing sensible defaults
const connectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
};

const scrapingQueue = new Queue('scrapingProcess',{connection: connectionOptions});
const submissionQueue = new Queue('submissionProcess',{connection: connectionOptions});

async function scrapingWorker(job) {
    console.log("something in");
    const req_problem = job.data;
    console.log(req_problem);
    return new Promise((resolve, reject) => {
        exec(`python3 routes/scraper.py ${req_problem}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(`Error: ${stderr}`);
                return;
            }
            try {
                const parsedOutput = JSON.parse(stdout);
                //TODO: backend crashes here if link is invalid
                if (redisClient.isOpen) {
                    redisClient.setEx(req_problem, 60000, JSON.stringify(parsedOutput));
                }
                resolve(parsedOutput);
            } catch (err) {
                console.error(err);
                reject("Invalid link");
                throw err;
            }
        });
    });
}

const worker = new Worker('scrapingProcess',scrapingWorker, {
    connection: connectionOptions,
    // Default to a single worker if the environment variable is undefined or invalid
    concurrency: parseInt(process.env.CONCURRENT_SCRAPING_WORKERS, 10) || 1
});
    

module.exports = {scrapingQueue, scrapingWorker: worker};
