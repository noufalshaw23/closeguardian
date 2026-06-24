import type {
  ControllerEvidenceBasis,
  ControllerExplanationAction,
  ControllerExplanationInput,
  ControllerExplanationOutput,
  ControllerExplanationResponse,
} from '../../../shared/contracts'

interface ControllerSynthesisOptions {
  apiKey: string
  model: string
}

interface OpenAiResponsesApiResult {
  output_text?: string
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
  error?: {
    message?: string
  }
}

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'

export async function synthesizeControllerExplanation(
  input: ControllerExplanationInput,
  options: ControllerSynthesisOptions,
): Promise<ControllerExplanationResponse> {
  if (!options.apiKey) {
    throw new Error('OpenAI API key is not configured.')
  }

  if (!options.model) {
    throw new Error('OpenAI model is not configured.')
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      store: false,
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text: buildDeveloperInstructions(input),
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(toGroundedPromptPayload(input), null, 2),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'closeguardian_controller_explanation',
          strict: true,
          schema: buildControllerExplanationSchema(input),
        },
      },
    }),
  })

  const result = (await response.json()) as OpenAiResponsesApiResult

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'OpenAI synthesis request failed.')
  }

  const outputText = extractOutputText(result)
  const explanation = parseControllerExplanation(outputText, input)

  return {
    generatedAt: new Date().toISOString(),
    generatedBy: 'server_openai_synthesis',
    model: options.model,
    input,
    explanation,
  }
}

function buildDeveloperInstructions(input: ControllerExplanationInput): string {
  return [
    'You are CloseGuardian Controller Copilot.',
    'Your job is to explain deterministic close assurance outputs to a finance controller.',
    'You must not decide or change readiness, risk severity, blocker severity, rerun safety, approval requirement, action status, or approval state.',
    'Use only the provided JSON payload. Do not invent blockers, actions, evidence, incidents, owners, amounts, or policy requirements.',
    'If a point is not established by the provided fields, say it is not established by provided evidence.',
    `Allowed action ids: ${input.recommendedActions.map((action) => action.id).join(', ') || 'none'}.`,
    `Allowed evidence ids: ${input.evidenceItems.map((evidence) => evidence.id).join(', ') || 'none'}.`,
    'Write concise enterprise finance language suitable for a controller review note.',
  ].join('\n')
}

function toGroundedPromptPayload(input: ControllerExplanationInput) {
  return {
    scenario: input.scenario,
    readinessSummary: input.readinessSummary,
    closeTask: {
      id: input.closeTask.id,
      title: input.closeTask.title,
      owner: input.closeTask.owner,
      approver: input.closeTask.approver,
      dueAt: input.closeTask.dueAt,
      status: input.closeTask.status,
      businessImpact: input.closeTask.businessImpact,
      blockerReason: input.closeTask.blockerReason,
    },
    deterministicRiskAssessment: input.riskAssessment,
    blockers: {
      failedJobs: input.blockers.failedJobs.map((job) => ({
        id: job.id,
        name: job.name,
        status: job.status,
        criticality: job.criticality,
        failureCode: job.failureCode,
        failureMessage: job.failureMessage,
        retryPolicy: job.retryPolicy,
        businessImpact: job.businessImpact,
      })),
      metadataIssues: input.blockers.metadataIssues.map((issue) => ({
        id: issue.id,
        productCode: issue.productCode,
        productName: issue.productName,
        issueType: issue.issueType,
        status: issue.status,
        severity: issue.severity,
        owner: issue.owner,
        blockerReason: issue.blockerReason,
        businessImpact: issue.businessImpact,
      })),
      serviceDependencies: input.blockers.serviceDependencies.map((dependency) => ({
        id: dependency.id,
        name: dependency.name,
        status: dependency.status,
        transientIssue: dependency.transientIssue,
        impactSummary: dependency.impactSummary,
      })),
    },
    incidentContext: input.incidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      rootCauseCategory: incident.rootCauseCategory,
      summary: incident.summary,
      remediationSummary: incident.remediationSummary,
    })),
    recommendedActions: input.recommendedActions.map((action) => ({
      id: action.id,
      title: action.title,
      summary: action.summary,
      executionMode: action.executionMode,
      approvalRequired: action.approvalRequired,
      status: action.status,
      reasonCodes: action.reasonCodes,
    })),
    approvalQueue: input.approvalRequests.map((approval) => ({
      id: approval.id,
      recommendedActionId: approval.recommendedActionId,
      approver: approval.approver,
      status: approval.status,
      reason: approval.reason,
      riskLevel: approval.riskLevel,
      decisionNotes: approval.decisionNotes,
    })),
    evidenceReferences: input.evidenceItems.map((evidence) => ({
      id: evidence.id,
      title: evidence.title,
      kind: evidence.kind,
      summary: evidence.summary,
      tags: evidence.tags,
    })),
    auditTrail: input.auditEvents.map((event) => ({
      id: event.id,
      type: event.type,
      actorId: event.actorId,
      subjectId: event.subjectId,
      summary: event.summary,
      occurredAt: event.occurredAt,
    })),
  }
}

function buildControllerExplanationSchema(input: ControllerExplanationInput) {
  const actionIdSchema = enumOrString(input.recommendedActions.map((action) => action.id))
  const evidenceIdSchema = enumOrString(input.evidenceItems.map((evidence) => evidence.id))

  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'executiveSummary',
      'businessImpact',
      'likelyRootCause',
      'recommendedActions',
      'approvalNotes',
      'confidenceNotes',
      'evidenceBasis',
    ],
    properties: {
      executiveSummary: { type: 'string' },
      businessImpact: { type: 'string' },
      likelyRootCause: { type: 'string' },
      recommendedActions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['actionId', 'title', 'controllerRationale'],
          properties: {
            actionId: actionIdSchema,
            title: { type: 'string' },
            controllerRationale: { type: 'string' },
          },
        },
      },
      approvalNotes: { type: 'string' },
      confidenceNotes: { type: 'string' },
      evidenceBasis: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['evidenceId', 'title', 'relevance'],
          properties: {
            evidenceId: evidenceIdSchema,
            title: { type: 'string' },
            relevance: { type: 'string' },
          },
        },
      },
    },
  }
}

function enumOrString(values: string[]) {
  if (values.length === 0) {
    return { type: 'string' }
  }

  return {
    type: 'string',
    enum: values,
  }
}

function extractOutputText(result: OpenAiResponsesApiResult): string {
  if (result.output_text) {
    return result.output_text
  }

  const outputText = result.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text' && content.text)?.text

  if (!outputText) {
    throw new Error('OpenAI response did not include structured output text.')
  }

  return outputText
}

function parseControllerExplanation(
  outputText: string,
  input: ControllerExplanationInput,
): ControllerExplanationOutput {
  const parsed = JSON.parse(outputText) as Partial<ControllerExplanationOutput>

  if (
    typeof parsed.executiveSummary !== 'string' ||
    typeof parsed.businessImpact !== 'string' ||
    typeof parsed.likelyRootCause !== 'string' ||
    typeof parsed.approvalNotes !== 'string' ||
    typeof parsed.confidenceNotes !== 'string' ||
    !Array.isArray(parsed.recommendedActions) ||
    !Array.isArray(parsed.evidenceBasis)
  ) {
    throw new Error('OpenAI structured output did not match the controller explanation contract.')
  }

  const explanation = {
    executiveSummary: parsed.executiveSummary,
    businessImpact: parsed.businessImpact,
    likelyRootCause: parsed.likelyRootCause,
    recommendedActions: parsed.recommendedActions.map(assertExplanationAction),
    approvalNotes: parsed.approvalNotes,
    confidenceNotes: parsed.confidenceNotes,
    evidenceBasis: parsed.evidenceBasis.map(assertEvidenceBasis),
  }

  assertGroundedOutput(explanation, input)

  return explanation
}

function assertExplanationAction(action: unknown): ControllerExplanationAction {
  if (
    !action ||
    typeof action !== 'object' ||
    typeof (action as ControllerExplanationAction).actionId !== 'string' ||
    typeof (action as ControllerExplanationAction).title !== 'string' ||
    typeof (action as ControllerExplanationAction).controllerRationale !== 'string'
  ) {
    throw new Error('OpenAI recommended action output was malformed.')
  }

  return action as ControllerExplanationAction
}

function assertEvidenceBasis(evidence: unknown): ControllerEvidenceBasis {
  if (
    !evidence ||
    typeof evidence !== 'object' ||
    typeof (evidence as ControllerEvidenceBasis).evidenceId !== 'string' ||
    typeof (evidence as ControllerEvidenceBasis).title !== 'string' ||
    typeof (evidence as ControllerEvidenceBasis).relevance !== 'string'
  ) {
    throw new Error('OpenAI evidence basis output was malformed.')
  }

  return evidence as ControllerEvidenceBasis
}

function assertGroundedOutput(
  explanation: ControllerExplanationOutput,
  input: ControllerExplanationInput,
) {
  const actionIds = new Set(input.recommendedActions.map((action) => action.id))
  const evidenceIds = new Set(input.evidenceItems.map((evidence) => evidence.id))

  for (const action of explanation.recommendedActions) {
    if (!actionIds.has(action.actionId)) {
      throw new Error(`OpenAI output referenced unknown action id: ${action.actionId}`)
    }
  }

  for (const evidence of explanation.evidenceBasis) {
    if (!evidenceIds.has(evidence.evidenceId)) {
      throw new Error(`OpenAI output referenced unknown evidence id: ${evidence.evidenceId}`)
    }
  }
}
