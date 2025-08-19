const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { spawn } = require('child_process');

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, input } = req.body;
  if (!code) {
    return res.status(400).send('Code is required.');
  }

  const tmpBase = path.join(os.tmpdir(), 'sandbox-');
  let workDir;

  try {
    workDir = await fs.mkdtemp(tmpBase);
    const sourcePath = path.join(workDir, 'main.cpp');
    const inputPath = path.join(workDir, 'input.txt');
    const outputPath = path.join(workDir, 'output.txt');

    await fs.writeFile(sourcePath, code, 'utf8');
    await fs.writeFile(inputPath, input || '', 'utf8');

    await new Promise((resolve, reject) => {
      const docker = spawn('docker', [
        'run', '--rm',
        '--memory', '256m', '--network', 'none',
        '-v', `${workDir}:/workspace`,
        '-w', '/workspace',
        'gcc:13',
        'bash', '-lc',
        'g++ main.cpp -o main && ./main < input.txt > output.txt'
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
