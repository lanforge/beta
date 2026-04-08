const express = require('express');
const app = express();
const router = express.Router();

router.get('/:id', (req, res) => {
  res.send('Caught by /:id with id=' + req.params.id);
});

router.get('/admin/:id', (req, res) => {
  res.send('Caught by /admin/:id with id=' + req.params.id);
});

app.use('/test', router);

const request = require('supertest');
request(app)
  .get('/test/admin/123')
  .end(function(err, res) {
    console.log(res.status, res.text);
    process.exit();
  });