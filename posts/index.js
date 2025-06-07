const express = require('express');
const { randomBytes } = require('crypto');

const app = express();

app.use(express.json()); // middleware to parse JSON bodies

const posts = {}; // store posts in memory

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts', (req, res) => {
  const id = randomBytes(4).toString('hex'); // generate a random ID
  const { title } = req.body;
  posts[id] = { id, title }; // store the post
  res.status(201).send(posts[id]);
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
