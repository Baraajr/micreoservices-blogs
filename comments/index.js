const express = require('express');
const { randomBytes } = require('crypto');

const app = express();

app.use(express.json()); // middleware to parse JSON bodies

const commentsByPostId = {}; // store comments in memory

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []); // return comments for the post or an empty array
});

app.post('/posts/:id/comments', (req, res) => {
  const commentId = randomBytes(4).toString('hex'); // generate a random ID

  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || []; // get existing comments or initialize an empty array

  comments.push({ id: commentId, content }); // add the new comment

  commentsByPostId[req.params.id] = comments; // store the updated comments array

  res.status(201).send(commentsByPostId[req.params.id]);
});

app.listen(4001, () => {
  console.log('Server is running on port 4001');
});
