const request = require('supertest');
const express = require('express');
const app = express();

// Simple endpoint for testing
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Success' });
});

describe('GET /api/test', () => {
    it('should return 200 and success message', async () => {
        const res = await request(app).get('/api/test');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Success');
    });
});
