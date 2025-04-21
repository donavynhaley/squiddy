const express = require('express');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

const app = express();
app.use(express.json());

const bots = {};

app.post('/participant', (req, res) => {
  const { roomCode, environment } = req.body;
  const botId = randomUUID();
  const containerName = `${botId}`;

  bots[botId] = containerName;

  const bot = spawn('docker', [
    'run',
    '--env', `ROOM_CODE=${roomCode}`,
    '--env', `ENVIRONMENT=${environment}`,
    '--name', containerName,
    '--network', 'nginx-proxy',
    'squiddy-bot'
  ]);

  bot.stdout.on('data', (data) => console.log(`[BOT ${botId}]: ${data}`));
  bot.stderr.on('data', (data) => console.error(`[BOT ${botId} ERR]: ${data}`));

  bot.on('exit', () => {
    delete bots[botId];
    console.log(`[BOT ${botId}] exited and cleaned up`);
  });

  console.log('Registered bot:', botId, '→', containerName);
  console.log('Current bots:', bots);

  res.send({ status: 'Bot launched', roomCode, botId });
});

app.delete('/participant/:botId', (req, res) => {
  const botId = req.params.botId;
  const containerName = bots[botId];

  if (!containerName) {
    return res.status(404).send({ error: 'Bot not found or already exited.' });
  }

  console.log(`Killing bot ${botId} with container name ${containerName}...`);

  const stop = spawn('docker', ['kill', containerName]);

  stop.on('exit', (code) => {
    if (code === 0) {
      delete bots[botId];
      console.log(`[BOT ${botId}] successfully killed`);
      res.send({ status: 'Bot killed', botId });
    } else {
      console.error(`[BOT ${botId}] failed to be killed`);
      res.status(500).send({ error: 'Failed to kill bot', botId });
    }
  });
});

app.delete('/participants', (req, res) => {
  const botIds = Object.keys(bots);
  if (botIds.length === 0) {
    return res.send({ status: 'No bots to kill' });
  }

  let killed = [];
  let failed = [];

  let pending = botIds.length;

  botIds.forEach((botId) => {
    const containerName = bots[botId];
    const stop = spawn('docker', ['kill', containerName]);

    stop.on('exit', (code) => {
      if (code === 0) {
        delete bots[botId];
        killed.push(botId);
        console.log(`[BOT ${botId}] killed`);
      } else {
        failed.push(botId);
        console.error(`[BOT ${botId}] failed to be killed`);
      }

      pending--;

      if (pending === 0) {
        res.send({
          status: 'All kill commands processed',
          killed,
          failed,
        });
      }
    });
  });
});


app.listen(4587, () => console.log('Activation server listening on port 4587'));
