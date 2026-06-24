import { defineEventHandler } from 'h3'
import { listTasks } from '../../repositories'

export default defineEventHandler(() => listTasks())
