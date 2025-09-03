const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Allow overriding the docker binary via environment variable
const DOCKER_CMD = process.env.DOCKER_CMD || 'docker';

// Time limit for running user code (in seconds)
const TIME_LIMIT = parseInt(process.env.TIME_LIMIT_SECONDS, 10) || 5;

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

    let image, compileCmd, runCmd;
    if (language === 'python') {
      image = 'python:3';
      compileCmd = 'python3 -m py_compile main.py';
      runCmd = `timeout ${TIME_LIMIT}s python3 main.py < input.txt > output.txt`;
    } else if (language === 'java') {
      image = 'openjdk:17';
      compileCmd = 'javac Main.java';
      runCmd = `timeout ${TIME_LIMIT}s java Main < input.txt > output.txt`;
    } else {
      image = 'gcc:13';
      compileCmd = 'g++ main.cpp -o main';
      runCmd = `timeout ${TIME_LIMIT}s ./main < input.txt > output.txt`;
    }

    // Compile step
    await new Promise((resolve, reject) => {
      const docker = spawn(DOCKER_CMD, [
        'run', '--rm',
        '--memory', '256m', '--network', 'none',
        '-v', `${workDir}:/workspace`,
        '-w', '/workspace',
        image,
        'bash', '-lc',
        compileCmd
      ]);

      let stderr = '';
      docker.stderr.on('data', d => (stderr += d.toString()));
      docker.on('error', err => reject({ type: 'compile', stderr: err.message }));
      docker.on('close', code => {
        if (code === 137) {
          // Process killed due to memory limit
          reject({ type: 'memory' });
        } else if (code !== 0) {
          reject({ type: 'compile', stderr });
        } else {
          resolve();
        }
      });
    });

    // Run step
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
      docker.on('error', err => reject({ type: 'runtime', stderr: err.message }));
      docker.on('close', code => {
        if (code === 124) {
          reject({ type: 'timeout' });
        } else if (code === 137) {
          // Docker uses 137 when the process is killed (e.g., OOM)
          reject({ type: 'memory' });
        } else if (code !== 0) {
          reject({ type: 'runtime', stderr });
        } else {
          resolve();
        }
      });
    });

    const output = await fs.readFile(outputPath, 'utf8');
    res.send(output);
  } catch (err) {
    console.error('Error during code execution:', err);
    if (err.code === 'ENOENT') {
      res.status(500).send('Docker is not installed or not in PATH');
    } else if (err.type === 'compile') {
      res.status(400).send('Compilation Error');
    } else if (err.type === 'timeout') {
      res.status(400).send('Time Limit Exceeded');
    } else if (err.type === 'memory') {
      res.status(400).send('Memory Limit Exceeded');
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
