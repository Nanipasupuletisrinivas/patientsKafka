"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientServiceImpl = void 0;
const impl_1 = require("./impl");
const service = new impl_1.NotificationService();
exports.patientServiceImpl = {
    postNotificationsCreate: service.create,
    deleteNotificationsDelete: service.delete,
    getNotificationsGet: service.get,
    getNotificationsGetAll: service.getAll,
    putNotificationUpdate: service.update,
};
