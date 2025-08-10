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
```

`TEST_DATA_DIR` controls where test files are saved and loaded from.

## Migrating existing S3 data

If you previously stored tests in S3, you can copy them locally using the
optional script:

```
node server/scripts/migrateFromS3.js <s3-bucket-name>
```

This script requires the AWS CLI to be installed and configured.

## User management

### API endpoints

- `POST /auth/register` – register a new user. Sends `username`, `email`, `password` and optionally `role` (`admin` or `user`). Creating an admin requires an existing admin's JWT in the `Authorization` header.
- `POST /auth/login` – log in with `email` and `password`. Returns a JWT and the user's role.

All protected routes expect the JWT in the `Authorization: Bearer <token>` header. Only users with role `admin` may create or edit problems.

### Frontend components

- `Login` and `Signup` pages interact with the new authentication endpoints.
- `Navbar` shows different options based on the logged-in user's role. Admins see links to create problems while normal users see links to solve problems.
