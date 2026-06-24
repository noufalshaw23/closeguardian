import { defineEventHandler } from 'h3'
import { listConnectorCapabilities } from '../connectors'

export default defineEventHandler(() => listConnectorCapabilities())
