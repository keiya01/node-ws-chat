import { Server, OPEN } from "ws";
import http from "http";
import redis from "redis";
import net from "net";

const server = http.createServer();
const wss = new Server({ noServer: true });

const port = process.argv[2] || 9000;

const broadcast = () => {
  const redisSub = redis.createClient();
  redisSub.subscribe("chat_messages");
  redisSub.on("message", (_, json) => {
    const data = JSON.parse(json);
    wss.clients.forEach(client => {
      if(client.readyState === OPEN) {
        client.send(data.message);
      }
    });
  });
}

const originWhiteList = [
  "http://localhost:3000",
  "http://localhost:3001"
];

const handleUpgradeWSS = () => {
  server.on("upgrade", (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const origin = request.headers["access-control-allow-origin"];
    if(origin && !originWhiteList.includes(origin)) {
      return socket.destroy();
    }

    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit("connection", ws, request);
    });
  });
}

const handleConnectWSS = () => {
  const redisPub = redis.createClient();
  wss.on("connection", ws => {
    console.log("connected!!");
    ws.on("message", msg => {
      console.log(`Listenning this port ${port}`);
      console.log(`Recieved Message: ${msg}`);
      redisPub.publish("chat_messages", JSON.stringify({
        message: msg.toString()
      }));
    });
  });
}

const connect = () => {
  handleConnectWSS();
  handleUpgradeWSS();
  broadcast();
  
  server.listen(port);
}

connect();
