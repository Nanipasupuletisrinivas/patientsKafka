import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/notifications/types";
import * as v from "../../../dist/validation";
// import { db } from "../../db";
import crypto from "crypto";
import { Kafka, Partitioners } from 'kafkajs';
import { nat_server } from "../../admin";
import { kafka_server } from "../../admin";
import { schemaRegistry_server } from "../../admin";
const kafka = new Kafka({
	clientId: 'my-app',
	brokers: [kafka_server],
})
import {
	SchemaRegistry,
	readAVSCAsync,
} from "@kafkajs/confluent-schema-registry";
import { connect, ErrorCode, StringCodec, Subscription } from 'nats'
import { TextEncoder } from 'text-encoding'
import { patientServiceImpl } from ".";
const registry = new SchemaRegistry({
	host: schemaRegistry_server,
});
const registerSchema = async () => {
	try {
		const schema = await readAVSCAsync("./src/impl/notifications/avro/schema.avsc");
		const { id } = await registry.register(schema);
		console.log("id log", id)
		return id;
	} catch (e) {
		console.log(e);
	}
};
export class NotificationService {

	constructor() {
		this.getAll = this.getAll.bind(this);
		this.get = this.get.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}

	/* *
	 ! Todo: Implement pagination for this service
	*/
	async getAll(
	
		limit: number | null | undefined,
		direction: Api.DirectionParamEnum | undefined,
		sortByField: string | null | undefined
	): Promise<t.GetNotificationsGetAllResponse> {
		try {
			// const appointmentsQuerySnap = await db.collection(`Appointments`).where("patientId", "==", patientId).get();
			// const appointments: Api.AppointmentDto[] = appointmentsQuerySnap.docs
			// 	.map((doc: { data: () => any; }) => doc.data())
			// 	.map((json: any) => v.modelApiAppointmentDtoFromJson("appointments", json));
			// console.log("appointments", appointments)
			// return {
			// 	status: 200,
			// 	body: {
			// 		items: appointments,
			// 		totalCount: appointments.length,
			// 	},
			// };
			const nc = await connect({ servers: nat_server })
			const sc = StringCodec()
			const data = {
				type: "getAll"
			}
				
		
			const ddata = JSON.stringify(data)
			const encoder = new TextEncoder()
			const enc = encoder.encode(ddata)
			const m = await nc
				.request('Notifications', enc, { timeout: 1000 });
			console.log({ data: sc.decode(m.data) })
			const natsOutput = JSON.parse(sc.decode(m.data))
			let res = []
			if (Array.isArray(natsOutput)) {
				res = natsOutput.map((item) => JSON.parse(item))
			}
			const apppintments: Api.NotificationData[] = res.map((item) => v.modelApiNotificationDataFromJson('Notifications', item))
			console.log({ apppintments })
			if (natsOutput == 404) {
				await nc.close()
				return {
					status: 404,
					body: { message: `No appointment found` },
				};
			}
			else {
				let appointment: Api.NotificationPagedResultDto = {
					totalCount: apppintments.length,
					items: apppintments
				}
				await nc.close()
				return {
					status: 200,
					body: appointment,
				};
			}
		} catch (error) {
			console.error(error);
			return {
				status: 404,
				body: { message: `something went wrong` }
			}
		}
	}

	async get(Notificationid: string): Promise<t.GetNotificationsGetResponse> {
		try {
			// const appointmentsDocSnap = (await db.collection(`Appointments`).where("slotId", "==", id).get()).docs[0];
			// if (!appointmentsDocSnap.exists) {
			// 	throw new Error("no-appointment-found");
			// }
			// const appointments = v.modelApiAppointmentDtoFromJson("appointments", appointmentsDocSnap.data());
			// console.log(appointments)
			// return {
			// 	status: 200,
			// 	body: appointments,
			// };
			const nc = await connect({ servers: nat_server })
			const sc = StringCodec()
			const data = {
				id: Notificationid,
				type: "get"
			}
			const ddata = JSON.stringify(data)
			const encoder = new TextEncoder()
			const enc = encoder.encode(ddata)
			const m = await nc
				.request('Notifications', enc, { timeout: 1000 });
			const natsOutput = JSON.parse(sc.decode(m.data))
			if (natsOutput == 404) {
				await nc.close()
				return {
					status: 404,
					body: { message: `No appointment found` },
				};
			}
			else {
				let appointment: Api.NotificationData = natsOutput
				await nc.close()
				return {
					status: 200,
					body: appointment,
				};
			}
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-appointments-found")) {
				return {
					status: 404,
					body: {
						message: "No appointments found with given id",
					},
				};
			}
			return {
				status: 404,
				body: { message: `something went wrong` }
			}
		}
	}

	async create(request: Api.NotificationData | undefined): Promise<t.PostNotificationsCreateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.appointmentdetails?.patientId) {
				throw new Error("no-patientId-found");
			}
			// if (await this._checkslotExists(request.appointmentDate, request.slotTime)) {
			// 	throw new Error("slot-already-bokked");

			// }
			const appointmentId = crypto.randomBytes(16).toString("hex");
			request.Notificationid= appointmentId;
			const appointRequest = v.modelApiNotificationDataFromJson("Notifications", request);
			try {
				const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner })
				await producer.connect()
				const registryId = await registerSchema();
				if (registryId) {
					const outgoingMessage = {
						key: `create#${request.Notificationid.toString()}`,
						value: await registry.encode(registryId, {
							...request,
							isExist: true,
							createdAt: new Date().toISOString()
						}),
					};
					await producer.send({
						topic: 'Notifications',
						messages: [
							outgoingMessage
						],
					})
				}
				return {
					status: 201,
					body: request,
				};
			} catch (error: any) {
				if (error.toString().match("no-patient-found")) {
					throw new Error("no-patient-found");
				}
				throw error;
			}
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("no-Id-found")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			if (error.toString().match("slot-already-bokked")) {
				return {
					status: 422,
					body: {
						message: "appointment already exists with given date and time",
					},
				};
			}
			return {
				status: 404,
				body: { message: `something went wrong` }
			}
		}
	}

	async update(request: Api.NotificationData | undefined): Promise<t.PutNotificationUpdateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.appointmentdetails?.patientId) {
				throw new Error("no-patientId-found");
			}

			if (!request.Notificationid) {
				throw new Error("no-Notification-found");
			}
			// if (await this._checkslotExists(request.appointmentDate, request.slotTime)) {
			// 	throw new Error("slot-already-bokked");

			// }
			const checkNotifications = await this.get(request.Notificationid)
			if (checkNotifications.status == 404) {
				throw new Error("no-appointment-found")
			}
			//const appointmentRequest = JSON.parse(JSON.stringify(request))
			const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner })
			await producer.connect()
			const registryId = await registerSchema();
			if (registryId) {
				const outgoingMessage = {
					key: `update#${request.Notificationid.toString()}`,
					value: await registry.encode(registryId, {
						...request,
						updatedAt: new Date().toISOString()
					}),
				};
				await producer.send({
					topic: 'Notifications',
					messages: [
						outgoingMessage
					],
				})
			}
			return {
				status: 200,
				body: {
					...request
				}
			}
			// const appointmentRef = db.collection(`Appointments`).doc(request.slotId);
			// await appointmentRef.update({
			// 	...appointmentRequest,
			// 	updatedAt: new Date().toISOString(),
			// });
			// return {
			// 	status: 200,
			// 	body: {
			// 		...appointmentRequest,
			// 	},
			// };


		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("no-slotId-found")) {
				return {
					status: 422,
					body: {
						message: "No slotId found in request",
					},
				};
			}
			if (error.toString().match("slot-already-bokked")) {
				return {
					status: 422,
					body: {
						message: "appointment already exists with given date and time",
					},
				};
			}
			if (error.toString().match("no-appointment-found")) {
				return {
					status: 422,
					body: {
						message: "no appointment found to update",
					},
				};
			}


			return {
				status: 422,
				body: {
					message: "no slotId found with given info",
				},
			};
		}
	}

	async delete(Notificationid: string,patientId: string): Promise<t.DeleteNotificationsDeleteResponse> {
		try {
			const checkAppointment = await this.get(Notificationid)
			if (checkAppointment.status == 404) {
				throw new Error("no-appointment-found")
			}
			if (checkAppointment.status === 200) {
				const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner })
				await producer.connect()
				const registryId = await registerSchema();
				var data = checkAppointment.body;
				//data. = false
				if (registryId) {
					const outgoingMessage = {
						key: `update#${Notificationid.toString()}`,
						value: await registry.encode(registryId, {
							...data,
							updatedAt: new Date().toISOString()
						}),
					};
					await producer.send({
						topic: 'Notifications',
						messages: [
							outgoingMessage
						],
					})
				}
				return {
					status: 200,
					body: {
						message: `appointment deleted successfully`
					}
				}
			}
			throw new Error("something-went-wrong")

			// await this._checkUserExists(slotId);
			// const appointmentRef = (await db.collection(`Appointments`).where("slotId", "==", slotId).where("patientId", "==", patientId).get()).docs[0].ref
			// await appointmentRef.update({
			// 	appointmentStatus: false,
			// 	updatedAt: new Date().toISOString(),
			// });
			// return {
			// 	status: 200,
			// 	body: {
			// 		...appointmentRef,
			// 		message: "appointment deleted successfully",
			// 		patientId: patientId,
			// 		slotId: slotId,


			// 	},
			// };

		} catch (error: any) {
			console.error(error?.response?.status);
			return {
				status: 404,
				body: {

					message: "appointment already deleted or no appointment found",
				},
			};
		}
	}

	// private async _checkUserExists(patientId: string) {
	// 	const response = await db.collection("PATIENTS").doc(patientId).get();
	// 	console.log("PATIENTS", response)
	// 	if (!response) {
	// 		throw new Error("no-patient-found");
	// 	}
	// 	return response.data();
	// }
	// private async _checkslotExists(appointmentDate: string, slotTime: string) {
	// 	try {
	// 		const appD = (await db.collectionGroup(`Appointments`).where("appointmentDate", "==", appointmentDate).get())
	// 		const slTime = (await db.collectionGroup(`Appointments`).where("slotTime", "==", slotTime).get()).docs[0].ref
	// 		console.log("appD:", appD)
	// 		console.log("slTime:", slTime)
	// 		// db.collection("PATIENTS").get().then((querySnapshot) => {
	// 		// querySnapshot.forEach((doc) => {
	// 		// console.log(`${doc.id} => ${doc.data()}`);});
	// 		// });
	// 		if (appD && slTime) {
	// 			return 1
	// 		}

	// 	}
	// 	catch {

	// 		return 0

	// 	}

	// }
}
