import { observable, makeObservable, action, computed } from 'mobx';
import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { PsistatsReport } from '@psimonweb/shared';
import { HighlightSpanKind } from 'typescript';

const ENDPOINT = 'http://' + window.location.host;

export class PsistatsStore {
  cache_max = 100;
  dashboard_path = '/dashboard';
  idle_max = 5000; // milliseconds
  dead_max = 10000; // milliseconds

  @observable hosts: string[];
  @observable connected: boolean;
  @observable cpu_usage: { [key: string]: number[] };
  @observable mem_usage: { [key: string]: Array<number[]> };
  @observable host_alive: { [key: string]: boolean };
  @observable last_msg: { [key: string]: number };

  socket: Socket;


  public constructor(endpoint: string) {
    makeObservable(this);

    this.hosts = [];
    this.connected = false;
    this.cpu_usage = {};
    this.mem_usage = {};
    this.host_alive = {};
    this.last_msg = {};

    this.socket = io(endpoint, {
      transports: ['websocket'],
      reconnectionDelay: 1000,
      path: this.dashboard_path,
      rememberUpgrade: true
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.idleTimer();
      console.log('psistatsClient: socket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('psistatsClient: socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error(err);
    });

    this.socket.on('report', (report: PsistatsReport) => {
      this.setReport(report);
    });
  }

  @action
  updateIdleStatus() {
    const now = Date.now();
    this.hosts.forEach((host) => {
      const interval = now - this.last_msg[host];
      if (interval > this.dead_max ) {
        this.removeHost(host);
      } else if (interval > this.idle_max) {
        this.deadHost(host);
      }
    });
  }

  idleTimer() {
    setTimeout(() => {
      this.updateIdleStatus();
      if (this.connected) {
        this.idleTimer();
      }
    }, this.idle_max);
  }

  @action
  addCpuReport(report: PsistatsReport) {

    let cpuValues = this.cpu_usage[report.hostname];

    if (cpuValues.length >= this.cache_max) {
      cpuValues.splice(0, cpuValues.length - this.cache_max);
    }

    cpuValues.push(report.value);

    this.cpu_usage = {
      ...this.cpu_usage,
      [report.hostname]: cpuValues
    }
  }

  @action
  removeHost(hostname: string) {
    console.log('remove host:', hostname);
    let idx = this.hosts.indexOf(hostname);



    this.hosts = [...this.hosts.filter((h) => h !== hostname)];

    delete this.host_alive[hostname];
    delete this.cpu_usage[hostname];
    delete this.mem_usage[hostname];


  }

  @action
  addHost(hostname: string) {

    const cacheArray = new Array(this.cache_max).fill(0);

    this.hosts.push(hostname);
    this.hosts.sort();
    this.host_alive = { ...this.host_alive, [hostname]: true};
    this.cpu_usage = {...this.cpu_usage, [hostname]: cacheArray };
    this.mem_usage = {...this.mem_usage, [hostname]: cacheArray };
    this.last_msg = {...this.last_msg, [hostname]: Date.now() };
  }

  @action
  setReport(report: PsistatsReport) {

    if (this.host_alive[report.hostname] !== false && this.host_alive[report.hostname] !== true) {
      console.log('new host detected:', report.hostname);
      this.addHost(report.hostname);
    } else {
      this.host_alive = {
        ...this.host_alive,
        [report.hostname]: true
      }

      this.last_msg = { ...this.last_msg, [report.hostname]: Date.now() };
    }

    if (report.reporter === 'cpu') {
      this.addCpuReport(report);
    }
  }

  @action
  deadHost(hostname: string) {
    console.log('dead host:', hostname);
    this.host_alive = {
      ...this.host_alive,
      [hostname]: false
    }
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }
}

export default createContext<PsistatsStore>(new PsistatsStore(ENDPOINT));