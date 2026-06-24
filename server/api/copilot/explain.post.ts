import { createError, defineEventHandler, readBody } from 'h3'
import type { ControllerExplanationRequest } from '../../../shared/contracts'
import { getControllerExplanationInput } from '../../repositories'
import { synthesizeControllerExplanation } from '../../services/openai'

export default defineEventHandler(async (event) => {
  const body = await readBody<ControllerExplanationRequest | undefined>(event).catch(() => undefined)
  const input = body?.input ?? getControllerExplanationInput(body?.taskId)

  if (!input) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Controller explanation input could not be built for the requested task.',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = String(runtimeConfig.openaiApiKey ?? '')
  const model = String(runtimeConfig.openaiModel ?? '')

  if (!apiKey || !model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Server-side OpenAI configuration is not available.',
    })
  }

  try {
    return await synthesizeControllerExplanation(input, {
      apiKey,
      model,
    })
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: error instanceof Error ? error.message : 'OpenAI synthesis failed.',
    })
  }
})
