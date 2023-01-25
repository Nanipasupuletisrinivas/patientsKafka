"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const v = __importStar(require("../../../dist/validation"));
// import { db } from "../../db";
const crypto_1 = __importDefault(require("crypto"));
const kafkajs_1 = require("kafkajs");
const admin_1 = require("../../admin");
const admin_2 = require("../../admin");
const admin_3 = require("../../admin");
const kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: [admin_2.kafka_server],
});
const confluent_schema_registry_1 = require("@kafkajs/confluent-schema-registry");
const nats_1 = require("nats");
const text_encoding_1 = require("text-encoding");
const registry = new confluent_schema_registry_1.SchemaRegistry({
    host: admin_3.schemaRegistry_server,
});
const registerSchema = async () => {
    try {
        const schema = await (0, confluent_schema_registry_1.readAVSCAsync)("./src/impl/notifications/avro/schema.avsc");
        const { id } = await registry.register(schema);
        console.log("id log", id);
        return id;
    }
    catch (e) {
        console.log(e);
    }
};
class NotificationService {
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
    async getAll(limit, direction, sortByField) {
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
            const nc = await (0, nats_1.connect)({ servers: admin_1.nat_server });
            const sc = (0, nats_1.StringCodec)();
            const data = {};
            const ddata = JSON.stringify(data);
            const encoder = new text_encoding_1.TextEncoder();
            const enc = encoder.encode(ddata);
            const m = await nc
                .request('Notifications', enc, { timeout: 1000 });
            console.log({ data: sc.decode(m.data) });
            const natsOutput = JSON.parse(sc.decode(m.data));
            let res = [];
            if (Array.isArray(natsOutput)) {
                res = natsOutput.map((item) => JSON.parse(item));
            }
            const apppintments = res.map((item) => v.modelApiNotificationDataFromJson('Notifications', item));
            console.log({ apppintments });
            if (natsOutput == 404) {
                await nc.close();
                return {
                    status: 404,
                    body: { message: `No appointment found` },
                };
            }
            else {
                let appointment = {
                    totalCount: apppintments.length,
                    items: apppintments
                };
                await nc.close();
                return {
                    status: 200,
                    body: appointment,
                };
            }
        }
        catch (error) {
            console.error(error);
            return {
                status: 404,
                body: { message: `something went wrong` }
            };
        }
    }
    async get(Notificationid) {
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
            const nc = await (0, nats_1.connect)({ servers: admin_1.nat_server });
            const sc = (0, nats_1.StringCodec)();
            const data = {
                Notificationid: Notificationid,
                type: "get"
            };
            const ddata = JSON.stringify(data);
            const encoder = new text_encoding_1.TextEncoder();
            const enc = encoder.encode(ddata);
            const m = await nc
                .request('Notifications', enc, { timeout: 1000 });
            const natsOutput = JSON.parse(sc.decode(m.data));
            if (natsOutput == 404) {
                await nc.close();
                return {
                    status: 404,
                    body: { message: `No appointment found` },
                };
            }
            else {
                let appointment = natsOutput;
                await nc.close();
                return {
                    status: 200,
                    body: appointment,
                };
            }
        }
        catch (error) {
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
            };
        }
    }
    async create(request) {
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
            const appointmentId = crypto_1.default.randomBytes(16).toString("hex");
            request.Notificationid = appointmentId;
            const appointRequest = v.modelApiNotificationDataFromJson("Notifications", request);
            try {
                const producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner });
                await producer.connect();
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
                    });
                }
                return {
                    status: 201,
                    body: request,
                };
            }
            catch (error) {
                if (error.toString().match("no-patient-found")) {
                    throw new Error("no-patient-found");
                }
                throw error;
            }
        }
        catch (error) {
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
            };
        }
    }
    async update(request) {
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
            const checkNotifications = await this.get(request.Notificationid);
            if (checkNotifications.status == 404) {
                throw new Error("no-appointment-found");
            }
            //const appointmentRequest = JSON.parse(JSON.stringify(request))
            const producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner });
            await producer.connect();
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
                });
            }
            return {
                status: 200,
                body: {
                    ...request
                }
            };
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
        }
        catch (error) {
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
    async delete(Notificationid, patientId) {
        try {
            const checkAppointment = await this.get(Notificationid);
            if (checkAppointment.status == 404) {
                throw new Error("no-appointment-found");
            }
            if (checkAppointment.status === 200) {
                const producer = kafka.producer({ createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner });
                await producer.connect();
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
                        topic: 'appointment',
                        messages: [
                            outgoingMessage
                        ],
                    });
                }
                return {
                    status: 200,
                    body: {
                        message: `appointment deleted successfully`
                    }
                };
            }
            throw new Error("something-went-wrong");
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
        }
        catch (error) {
            console.error(error?.response?.status);
            return {
                status: 404,
                body: {
                    message: "appointment already deleted or no appointment found",
                },
            };
        }
    }
}
exports.NotificationService = NotificationService;
