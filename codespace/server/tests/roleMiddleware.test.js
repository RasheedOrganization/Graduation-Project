const authorize = require('../middleware/roleMiddleware');

test('allows user with required role', () => {
  const req = { user: { role: 'admin' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  authorize('admin')(req, res, next);
  expect(next).toHaveBeenCalled();
});

test('blocks user with insufficient role', () => {
  const req = { user: { role: 'user' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  authorize('admin')(req, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
});
