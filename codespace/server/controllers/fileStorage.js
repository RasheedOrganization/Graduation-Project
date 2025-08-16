const fs = require('fs').promises;
const path = require('path');

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || path.join(__dirname, '..', 'test-data');

async function saveFile(folder, filename, data) {
  const dirPath = path.join(TEST_DATA_DIR, folder);
  await fs.mkdir(dirPath, { recursive: true });
  return fs.writeFile(path.join(dirPath, filename), data);
}

async function loadFile(folder, filename) {
  const filePath = path.join(TEST_DATA_DIR, folder, filename);
  return fs.readFile(filePath, 'utf8');
}

async function getTestData(problemId) {
  try {
    const main_tests = await loadFile(problemId, 'input.txt');
    const expected_output = await loadFile(problemId, 'output.txt');
    return { main_tests, expected_output };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { saveFile, loadFile, getTestData };
