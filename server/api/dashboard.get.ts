import { defineEventHandler } from 'h3'
import { getDashboard } from '../repositories'

export default defineEventHandler(() => getDashboard())
