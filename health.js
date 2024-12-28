import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

export function startHealthServer() {
  app.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });
}