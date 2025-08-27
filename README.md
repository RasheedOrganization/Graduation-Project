# Software-Graduation-Project

## Local test data storage

Problem test cases are stored on the filesystem instead of AWS S3. Each
problem has its own directory under `server/test-data/<problemId>/` containing
`input.txt` and `output.txt`.

## Configuration

Create environment files from the provided examples:

```
cp .env.example .env
cp codespace/server/.env.example codespace/server/.env
cp codespace/frontend/.env.example codespace/frontend/.env
```

The root `.env` is used by Docker Compose. The server and frontend read `.env`
files in their own directories when running without Docker.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `TEST_DATA_DIR` | Location for problem test files |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `REDIS_URL` | Redis connection URL |
| `REACT_APP_BACKEND_URL` | API endpoint for the frontend |

Default values for both Docker and manual setups are shown in the `.env.example`
files.

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

Copy `.env.example` to `.env` and build/start the containers:

```bash
cp .env.example .env
docker-compose up --build
```

The services will be available at:

- Frontend: http://localhost:3000
- API server: http://localhost:6909
- MongoDB: localhost:27017
- Redis: localhost:6379

## Running manually

Ensure MongoDB and Redis are running locally, create `.env` files for the server
and frontend, then start both:

```bash
cp codespace/server/.env.example codespace/server/.env
cp codespace/frontend/.env.example codespace/frontend/.env

# in one terminal
cd codespace/server
npm install
npm start

# in another terminal
cd codespace/frontend
npm install
npm start
```

Adjust any variables in the `.env` files if your local services run on different
hosts or ports.

### Code execution sandbox

The `/test` endpoint compiles and runs user-submitted C++ code inside a
throwaway Docker container for isolation. Make sure the Docker daemon is
available and the `docker` CLI is installed on the machine running the API
server. If the CLI lives at a non-default path, set the `DOCKER_CMD`
environment variable to the desired executable before starting the server.
The `codespace/server/test-data` directory is bind-mounted into the server
container, ensuring the Docker daemon can access temporary source files created
for compilation.
