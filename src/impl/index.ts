import { NotificationsApi } from "../../dist/api/notifications/types";
import { ApiImplementation } from "../../dist/types";
import { patientServiceImpl } from "./notifications";

export class ServiceImplementation implements ApiImplementation {
	notifications: NotificationsApi = patientServiceImpl;
}
