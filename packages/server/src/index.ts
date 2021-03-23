import express from 'express';
import mqtt from 'mqtt';
import { IClientOptions } from 'mqtt';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';


const sockets: Array<Socket> = [];

const app = express();
app.use(cors());

const httpServer = new http.Server(app);


const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
});


const port = 9090;

const mqttopts: IClientOptions = {
  port: 8883,
  host: 'psikon.com',
  protocol: 'mqtts',
  username: 'psistats',
  password: ''
}

const mqttclient = mqtt.connect(mqttopts);

mqttclient.subscribe('psistats/+');
mqttclient.on('message', (topic, message) => {
  io.sockets.emit('report', JSON.parse(message.toString()));
});

httpServer.listen(port, () => {
  console.log('http://localhost:' + port);
});
