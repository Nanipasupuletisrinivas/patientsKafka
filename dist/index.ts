/* eslint-disable */
// tslint:disable
/**
 * Notifications Service
 * Notifications Service
 *
 * OpenAPI spec version: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator+.
 * https://github.com/karlvr/openapi-generator-plus
 * Do not edit the class manually.
 */

import { Express } from 'express'
import notifications from './api/notifications'
import * as t from './types'

export default function(app: Express, impl: t.ApiImplementation) {
	notifications(app, impl.notifications)
}
