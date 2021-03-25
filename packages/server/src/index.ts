import express from 'express';
import mqtt from 'mqtt';
import { IClientOptions } from 'mqtt';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';


const app = express();
app.use(cors());

app.use(express.static('public'));

const httpServer = new http.Server(app);


const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },

  path: '/dashboard'
});

io.on('connect', (socket) => {
  socket.on('disconnect', (err) => {
    console.error('disconnect: ', err);
  });
  console.log('socketio connected');
});


const port = 9090;

const mqttopts: IClientOptions = {
  port: 8883,
  host: 'psikon.com',
  protocol: 'mqtts',
  username: 'psistats',
  password: '@.!&uLwxUj+0(QU8/{uj'
}

const mqttclient = mqtt.connect(mqttopts);

mqttclient.subscribe('psistats/+');
mqttclient.on('message', (topic, message) => {
  io.sockets.emit('report', JSON.parse(message.toString()));
});

httpServer.listen(port, () => {
  console.log('Dashboard server listening on http://localhost:' + port);
});
