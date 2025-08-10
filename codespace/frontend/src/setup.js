// setup.js
const process = require('process'); // Import the 'process' package

if (typeof process.env.NODE_ENV === 'undefined') {
  process.env.NODE_ENV = 'development'; // Set NODE_ENV if not defined
}

if (typeof process.env.CUSTOM_VARIABLE === 'undefined') {
  process.env.CUSTOM_VARIABLE = 'your_value'; // Set your custom environment variable
}

if (typeof process.env.REACT_APP_BACKEND_URL === 'undefined') {
  process.env.REACT_APP_BACKEND_URL = 'http://localhost:6909';
}

window.process = process; // Make 'process' available in the global scope

