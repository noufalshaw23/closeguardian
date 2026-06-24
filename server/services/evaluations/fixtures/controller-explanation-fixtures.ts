import type { ControllerExplanationResponse } from '../../../../shared/contracts'
import { getControllerExplanationInput } from '../../../repositories'

const input = getControllerExplanationInput()

if (!input) {
  throw new Error('Controller explanation fixture input could not be built.')
}

export const groundedControllerExplanationFixture: ControllerExplanationResponse = {
  generatedAt: '2026-06-25T08:30:00Z',
  generatedBy: 'server_openai_synthesis',
  model: 'fixture-model',
  input,
  explanation: {
    executiveSummary:
      'Revenue close is blocked because the close-critical revenue posting job failed and the new product revenue mapping is still open.',
    businessImpact:
      'The current deterministic assessment shows critical risk, blocked readiness, and revenue at risk from incomplete posting and product mapping.',
    likelyRootCause:
      'The job failure is aligned to a transient Finance Warehouse timeout, while the product mapping issue is a separate metadata governance blocker.',
    recommendedActions: [
      {
        actionId: 'action-request-rerun-approval',
        title: 'Request approval to rerun revenue posting job',
        controllerRationale:
          'The rerun action is approval-required because the job is close-critical and policy requires controller review.',
      },
      {
        actionId: 'action-notify-metadata-owner',
        title: 'Notify metadata owner of unmapped product',
        controllerRationale:
          'The metadata owner should review the missing revenue mapping before controller certification.',
      },
    ],
    approvalNotes:
      'The controller approval request should focus on the controlled rerun of action-request-rerun-approval.',
    confidenceNotes:
      'Confidence is based on the seeded job log, incident history, metadata exception, and rerun policy evidence.',
    evidenceBasis: [
      {
        evidenceId: 'ev-rev-job-log',
        title: 'Revenue posting job failure log',
        relevance: 'Shows the warehouse timeout failure for the close-critical posting job.',
      },
      {
        evidenceId: 'ev-rerun-policy',
        title: 'Close job rerun approval policy',
        relevance: 'Establishes the controller approval boundary for the rerun.',
      },
    ],
  },
}

export const inventedEvidenceControllerExplanationFixture: ControllerExplanationResponse = {
  ...groundedControllerExplanationFixture,
  explanation: {
    ...groundedControllerExplanationFixture.explanation,
    evidenceBasis: [
      ...groundedControllerExplanationFixture.explanation.evidenceBasis,
      {
        evidenceId: 'ev-invented-bank-confirmation',
        title: 'Invented bank confirmation',
        relevance: 'This evidence is not present in the deterministic input.',
      },
    ],
  },
}
