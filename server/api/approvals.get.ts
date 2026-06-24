import { defineEventHandler } from 'h3'
import { listApprovals } from '../repositories'

export default defineEventHandler(() => listApprovals())
