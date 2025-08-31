const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Allow overriding the docker binary via environment variable
const DOCKER_CMD = process.env.DOCKER_CMD || 'docker';

async function isDockerAvailable() {
  try {
    await execAsync(`${DOCKER_CMD} --version`);
    return true;
  } catch {
    return false;
  }
}

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, input, language = 'cpp' } = req.body;
  if (!code) {
    return res.status(400).send('Code is required.');
  }

  if (!(await isDockerAvailable())) {
    return res.status(500).send('Docker is not installed or not in PATH');
  }

  const TEST_DATA_DIR = process.env.TEST_DATA_DIR || path.join(__dirname, '..', 'test-data');
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  const tmpBase = path.join(TEST_DATA_DIR, 'sandbox-');
  let workDir;

  try {
    workDir = await fs.mkdtemp(tmpBase);
    const sourceName = language === 'python' ? 'main.py' : language === 'java' ? 'Main.java' : 'main.cpp';
    const sourcePath = path.join(workDir, sourceName);
    const inputPath = path.join(workDir, 'input.txt');
    const outputPath = path.join(workDir, 'output.txt');

    await fs.writeFile(sourcePath, code, 'utf8');
    await fs.writeFile(inputPath, input || '', 'utf8');

    let image, runCmd;
    if (language === 'python') {
      image = 'python:3';
      runCmd = 'python3 main.py < input.txt > output.txt';
    } else if (language === 'java') {
      image = 'openjdk:17';
      runCmd = 'javac Main.java && java Main < input.txt > output.txt';
    } else {
      image = 'gcc:13';
      runCmd = 'g++ main.cpp -o main && ./main < input.txt > output.txt';
    }

    await new Promise((resolve, reject) => {
      const docker = spawn(DOCKER_CMD, [
        'run', '--rm',
        '--memory', '256m', '--network', 'none',
        '-v', `${workDir}:/workspace`,
        '-w', '/workspace',
        image,
        'bash', '-lc',
        runCmd
      ]);

      let stderr = '';
      docker.stderr.on('data', d => (stderr += d.toString()));
      docker.on('error', err => reject(err));
      docker.on('close', code => {
        if (code !== 0) reject({ code, stderr });
        else resolve();
      });
    });

    const output = await fs.readFile(outputPath, 'utf8');
    res.send(output);
  } catch (err) {
    console.error('Error during code execution:', err);
    if (err.code === 'ENOENT') {
      res.status(500).send('Docker is not installed or not in PATH');
    } else if (err.stderr) {
      res.status(400).send(err.stderr);
    } else {
      res.status(500).send('Internal Server Error');
    }
  } finally {
    if (workDir) {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }
});

module.exports = router;
