import { defineEventHandler } from 'h3'
import { listAuditEvents } from '../repositories'

export default defineEventHandler(() => listAuditEvents())
