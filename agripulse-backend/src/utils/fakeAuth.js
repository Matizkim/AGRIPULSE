

// Temporary auth bypass for local testing
export function fakeAuth(req, res, next) {
  // Simulate an authenticated user
  req.user = { userId: "507f1f77bcf86cd799439011" }; 
  next();
}
