export default class Subject {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    unsubscribe(observer) {
        const index = this.observers.indexOf(observer);
        if (index <= -1) {
            console.error(`Observer not subscribed to Subject ${observer}`); // eslint-disable-line no-console
        } else {
            this.observers.splice(index, 1);
        }
    }

    notifyAll(...params) {
        this.observers.forEach((observer) => observer(...params));
    }
}
