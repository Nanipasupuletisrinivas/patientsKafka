import { NotificationService } from "./impl";
import * as t from "../../../dist/api/notifications/types";

const service = new NotificationService();

export const patientServiceImpl: t.NotificationsApi = {
	postNotificationsCreate: service.create,
	deleteNotificationsDelete: service.delete,
	getNotificationsGet: service.get,
    getNotificationsGetAll: service.getAll,
	putNotificationUpdate: service.update,

};
