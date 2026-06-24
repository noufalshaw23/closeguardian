import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getTaskDetail } from '../../repositories'

export default defineEventHandler((event) => {
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  const taskDetail = getTaskDetail(taskId)

  if (!taskDetail) {
    throw createError({
      statusCode: 404,
      statusMessage: `Task not found: ${taskId}`,
    })
  }

  return taskDetail
})
