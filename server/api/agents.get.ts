import { defineEventHandler } from 'h3'
import { closeGuardianPersonas } from '../../shared/agent-config'

export default defineEventHandler(() => ({
  personas: closeGuardianPersonas,
}))
