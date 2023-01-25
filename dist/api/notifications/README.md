# Notifications

## Operations

### putNotificationUpdate

```http
PUT /notification/update
```


### postNotificationsCreate

```http
POST /notifications/create
```


### deleteNotificationsDelete

```http
DELETE /notifications/delete
```


### getNotificationsGet

```http
GET /notifications/get
```


### getNotificationsGetAll

```http
GET /notifications/getAll
```


## Implementation

This is an example of the API implementation to use to update the actual API implementation
when the API structure has changed.

```typescript
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
```
