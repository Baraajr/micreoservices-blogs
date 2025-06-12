const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    console.log('Event Received:', type, data);
    const status = data.content.includes('orange') ? 'rejected' : 'approved';
    console.log('Comment Moderation Status:', status);
    const dataToSend = {
      id: data.id,
      postId: data.postId,
      status,
      content: data.content,
    };
    console.log('Data to be sent:', dataToSend);
    // send event to event bus
    axios
      .post('http://event-bus-srv:4005/events', {
        type: 'CommentModerated',
        data: dataToSend,
      })
      .catch((err) => {
        console.error('Error sending event:', err.message);
      });
  }
  res.send({});
});

app.listen(4003, () => {
  console.log('Listening on 4003');
});
