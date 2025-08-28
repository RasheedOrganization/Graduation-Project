const fetch = require('node-fetch');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:6909';

async function seed() {
  const contests = [
    {
      name: 'Seeded Upcoming Contest',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      duration: 90,
      problems: []
    },
    {
      name: 'Seeded Past Contest',
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      duration: 60,
      problems: []
    }
  ];

  for (const contest of contests) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contest)
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`Created contest: ${data.name}`);
      } else {
        console.error(`Failed to create contest: ${data.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Error creating contest', err);
    }
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/contests`);
    const data = await res.json();
    console.log(`Upcoming contests: ${data.upcoming.length}`);
    console.log(`Past contests: ${data.past.length}`);
  } catch (err) {
    console.error('Error fetching contests', err);
  }
}

seed();
