import { Server } from "ws";
import http from "http";
import redis from "redis";

const port = process.argv[2] || 9000;

const setup = () => {
  const server = http.createServer();
  const wss = new Server({ server });
  
  return { server, wss };
}

const broadcast = (wss: Server) => {
  const redisSub = redis.createClient();
  redisSub.subscribe("chat_messages");
  redisSub.on("message", (_, message) => {
    wss.clients.forEach(client => {
      client.send(message);
    });
  });
}

const connect = () => {
  const redisPub = redis.createClient();
  const { server, wss } = setup();

  
  wss.on("connection", ws => {
    console.log("connected!!");
    ws.on("message", msg => {
      console.log(`Listenning this port ${port}`);
      console.log(`Recieved Message: ${msg}`);
      redisPub.publish("chat_messages", msg.toString());
    });
  });

  broadcast(wss);
  
  server.listen(port);
}

connect();
