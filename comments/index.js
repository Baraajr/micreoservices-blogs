const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');
const { stat } = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  // send event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  res.status(201).send(comments);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  console.log('Event Received', req.body.type);

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    const comments = commentsByPostId[postId];
    console.log('Comments for postId:', postId, comments);
    const comment = comments.find((comment) => {
      return comment.id === id;
    });

    if (comment) {
      comment.status = status;

      // send event to event bus
      axios
        .post('http://event-bus-srv:4005/events', {
          type: 'CommentUpdated',
          data: {
            id,
            postId,
            status,
            content,
          },
        })
        .catch((err) => {
          console.error('Error sending event:', err.message);
        });
    }
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
