export default class Observer {
    constructor() {
        this.setState = this.setState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.broadcast = this.broadcast.bind(this);

        this.state = null;
        this.subscribers = [];
    }

    setState(state) {
        this.state = state;
        this.broadcast(this.state);
    }

    subscribe(func) {
        this.subscribers.push(func);
        return () => {
            const index = this.subscribers.indexOf(func);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    broadcast() {
        this.subscribers.forEach((subscriber) => {
            subscriber(this.state);
        });
    }
}
