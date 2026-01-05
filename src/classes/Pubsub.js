class Pubsub {
  constructor() {
    this.events = {};
  }

  subscribe(event, cb) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(cb);
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((cb) => cb(data));
  }
}

export const pubsub = new Pubsub();
