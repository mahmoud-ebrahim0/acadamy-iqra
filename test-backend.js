const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/client/checkout',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({
  name: 'Test',
  email: 'test@test.com',
  password: '123',
  courseId: '60c72b2f9b1d8b0015a7b8e1',
  paymentMethod: 'Vodafone Cash'
}));
req.end();
