import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { decideApproval } from '../../../repositories'
import type { ApprovalDecisionRequest } from '../../../../shared/contracts'

export default defineEventHandler(async (event) => {
  const approvalRequestId = getRouterParam(event, 'id')

  if (!approvalRequestId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Approval request id is required.',
    })
  }

  const body = await readBody<ApprovalDecisionRequest | undefined>(event)

  if (!body || (body.decision !== 'approve' && body.decision !== 'reject')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Decision must be approve or reject.',
    })
  }

  const result = decideApproval(approvalRequestId, body)

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: `Approval request not found: ${approvalRequestId}`,
    })
  }

  return result
})
