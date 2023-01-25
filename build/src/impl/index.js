"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceImplementation = void 0;
const notifications_1 = require("./notifications");
class ServiceImplementation {
    constructor() {
        this.notifications = notifications_1.patientServiceImpl;
    }
}
exports.ServiceImplementation = ServiceImplementation;
