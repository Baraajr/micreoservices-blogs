const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const handleEvents = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    if (posts[postId]) {
      posts[postId].comments.push({ id, content, status });
    }
  }

  if (type === 'CommentUpdated') {
    const { id, postId, content, status } = data;
    if (posts[postId]) {
      const comment = posts[postId].comments.find((c) => c.id === id);
      if (comment) {
        comment.status = status;
        comment.content = content;
      }
    }
  }
};
const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvents(type, data);

  console.log('Event Received:', type);
  console.log(posts);
  res.send({});
});

app.listen(4002, async () => {
  console.log('Listening on 4002');
  // whenever the query service starts, it should fetch all events from the event bus
  const res = await axios.get('http://localhost:4005/events');
  for (let event of res.data) {
    console.log('Processing event:', event.type);
    handleEvents(event.type, event.data);
  }
});
