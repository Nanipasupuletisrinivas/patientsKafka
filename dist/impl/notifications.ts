import * as t from '../api/notifications/types'
import { Api } from '../models'

async function putNotificationUpdate(request: Api.NotificationData | undefined): Promise<t.PutNotificationUpdateResponse> {
	throw 'Unimplemented'
}

async function postNotificationsCreate(request: Api.NotificationData | undefined): Promise<t.PostNotificationsCreateResponse> {
	throw 'Unimplemented'
}

async function deleteNotificationsDelete(notificationid: string, patientId: string): Promise<t.DeleteNotificationsDeleteResponse> {
	throw 'Unimplemented'
}

async function getNotificationsGet(notificationid: string, patientId: string): Promise<t.GetNotificationsGetResponse> {
	throw 'Unimplemented'
}

async function getNotificationsGetAll(limit: number | null | undefined, direction: Api.DirectionParamEnum | undefined, sortByField: string | null | undefined): Promise<t.GetNotificationsGetAllResponse> {
	throw 'Unimplemented'
}


const api: t.NotificationsApi = {
	putNotificationUpdate,
	postNotificationsCreate,
	deleteNotificationsDelete,
	getNotificationsGet,
	getNotificationsGetAll,
}

export default api
