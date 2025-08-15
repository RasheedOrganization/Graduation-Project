# Software-Graduation-Project

## Local test data storage

Problem test cases are stored on the filesystem instead of AWS S3. Each
problem has its own directory under `server/test-data/<problemId>/` containing
`input.txt` and `output.txt`.

## Environment variables

Create a `.env` file inside the `server/` folder with:

```
MONGODB_URI=<your mongodb uri>
TEST_DATA_DIR=./test-data
JWT_SECRET=<your jwt secret>
```

`TEST_DATA_DIR` controls where test files are saved and loaded from.

## Migrating existing S3 data

If you previously stored tests in S3, you can copy them locally using the
optional script:

```
node server/scripts/migrateFromS3.js <s3-bucket-name>
```

This script requires the AWS CLI to be installed and configured.

## Frontend entry flow

The React frontend now provides a landing page and authentication funnel:

- `http://localhost:3000/` – Welcome page with a hero banner and a button to log in or sign up.
- `/login` – Login form that posts to `/api/auth/login` and stores the returned JWT. Successful logins redirect to `/join`.
- `/signup` – Signup form for new users posting to `/api/auth/register`. After registration the user is redirected to `/login`.

To run the frontend locally:

```
cd codespace/frontend
npm install
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) in your browser.

## Running with Docker

Use Docker Compose to run the backend, frontend, MongoDB, and Redis without installing dependencies manually.

```bash
docker-compose up --build
```

This starts the services on:

- Frontend: http://localhost:3000
- API server: http://localhost:6909
- MongoDB: localhost:27017
- Redis: localhost:6379

The server uses the `.env` values defined in `docker-compose.yml`. Edit the file if you need different settings.
