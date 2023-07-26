import { WebSocketServer } from 'ws';
import MongoClient from './utils/MongoClient.js';
import RedisCache from './utils/RedisCache.js';
import Constants from './utils/Constants.js';
import Utils from './utils/Utils.js';

const redis = new RedisCache();

const wss = new WebSocketServer({
  port: process.env.SERVER_PORT ?? 8080
})

wss.on('connection', (ws) => {
  ws.authenticated = false;
  ws.checkedIn = true;
  ws.timer = setInterval(() => {
    if (!ws.checkedIn || !ws.authenticated) return ws.close(4000, 'missed_heartbeat')
    return ws.checkedIn = false
  }, 35000)

  ws.on('message', async (message) => {
    const raw = message.toString()
    const data = Utils.tryParseJSON(raw)
    if (!data || Utils.isNotObject(data)) {
      console.log(`[Websocket] Recieved invalid response from socket:\n${data ? JSON.stringify(data) : raw}`)
      return ws.close(4006, 'invalid_payload')
    }

    if (!('op' in data) || !('d' in data)) {
      console.log(`[WebSocket] Recieved json with invalid format from socket:\n[Decoded] ${JSON.stringify(data)}`)
      return ws.close(4006, 'invalid_payload')
    }

    switch (data.op) {
      case 3:
        ws.checkedIn = true;
        break;
      case 2:
        if (!('d' in data) || !('k' in data.d)) {
          console.log(`[WebSocket] Recieved invalid opcode 2 without d.k present: ${JSON.stringify(data)}`)
          return ws.close(4005, 'requires_auth_string')
        }
        const document = await MongoClient.db('controller').collection('runners').findOne({ key: data.d.k })
        if (!document) return ws.close(4005, 'requires_valid_auth')
        console.log(`Found valid auth document: ${JSON.stringify(document)}`);
        ws.authenticated = { key: data.d.k, id: document.id }
        return ws.send(JSON.stringify(Constants.AuthenticationSuccess))
      case 0:
        if (!('d' in data) || !('t' in data)) {
          console.log(`[WebSocket] Recieved invalid opcode 0 without d or t present: ${JSON.stringify(data)}`)
          return ws.close(4006, 'invalid_payload')
        }

        console.log(`[Debug] ${JSON.stringify(data)}`)
      default:
        return ws.close(4004, 'unknown_opcode')
    }
  });

  return ws.send(JSON.stringify(Constants.Initialize))
});

wss.on('close', (ws) => {
  clearInterval(ws.timer);
})
