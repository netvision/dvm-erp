const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Server is running');
  });
});

describe('Authentication', () => {
  test('POST /api/auth/login without credentials should return 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('status', 'error');
  });

  test('POST /api/auth/register with invalid email should return 400', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('status', 'error');
  });
});

describe('Books API', () => {
  test('GET /api/books should return books list', async () => {
    const response = await request(app)
      .get('/api/books')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
  });
});

describe('404 Handler', () => {
  test('GET /non-existent-route should return 404', async () => {
    const response = await request(app)
      .get('/non-existent-route')
      .expect(404);
    
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Route not found');
  });
});