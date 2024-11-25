export default class RotationOrder {
    constructor(initialOrder = "XYZ") {
        this.order = [];
        this.set(initialOrder);
    }

    set(newOrder) {
        this.order = newOrder.toUpperCase().split('').slice(0, 3);
    }

    push(axis) {
        axis = axis.toUpperCase();
        if (this.order[2] === axis) return;

        const allowed = /^[xyz]$/i
        if (!allowed.test(axis)) throw new Error("Axis must be one of X, Y, or Z");

        const currIdx = this.order.indexOf(axis);
        if (currIdx !== -1) {
            this.order.splice(currIdx, 1);
        }

        this.order.push(axis);
    }

    get() {
        return this.order.join('');
    }
}