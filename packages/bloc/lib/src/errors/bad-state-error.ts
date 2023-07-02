export class BadState extends Error {
    constructor() {
        super("Cannot Emit New States After Cubit Closed");
    }
}