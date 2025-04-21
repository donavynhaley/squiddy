# 🐙 Squiddy

**Squiddy** is a lightweight bot spawner for automated testing of your video call application. It simulates participants by spawning Dockerized Playwright bots that join video rooms with a fake webcam feed. Designed for stress-testing, video pipeline verification, and end-to-end call scenarios.

---

## How It Works

- You send an HTTP request to Squiddy.
- It launches a Docker container that runs a headless browser.
- The browser joins a specified video call room with a fake video stream.
- You can add, remove, or clear all Squiddy participants at will.

---

## API Endpoints

Base URL: `http://localhost:4587`

### `POST /participant`

Launch a new Squiddy bot to join a room.

**Request Body**
```json
{
  "roomCode": "string",          // required – the call room code
  "environment": "prod"          // optional – one of "prod", "dev", or "test"
}
```

**Response**
```json
{
  "status": "Bot launched",
  "roomCode": "example123",
  "botId": "c123abc4-567d-890e-fghi-1234567890jk"
}
```

---

### `DELETE /participant/:botId`

Stop a specific Squiddy bot using its `botId`.

**Path Parameter**
- `botId`: The unique ID returned from the `/participant` response

**Response**
```json
{
  "status": "Bot killed",
  "botId": "c123abc4-567d-890e-fghi-1234567890jk"
}
```

---

### `DELETE /participants`

Stop and clean up **all** currently running Squiddy bots.

**Response**
```json
{
  "status": "All kill commands processed",
  "killed": ["botId1", "botId2"],
  "failed": []
}
```

---

## Example Usage

### Launch a bot:
```bash
curl -X POST http://localhost:4587/participant \
  -H "Content-Type: application/json" \
  -d '{"roomCode": "abc123", "environment": "prod"}'
```

### Kill a specific bot:
```bash
curl -X DELETE http://localhost:4587/participant/{botId}
```

### Kill all bots:
```bash
curl -X DELETE http://localhost:4587/participants
```

---

## Roadmap Ideas
- Dashboard UI to visualize and manage bots
- Timeout-based auto-kill for inactive bots
- Room-aware fake video or avatar identity
- Live metrics & logs endpoint
- Endpoints to trigger UI behavior (e.g., sends message, toggles mic/video)

---

## License
MIT
