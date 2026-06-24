import { demoScenario } from '../data'
import { listApprovals } from '../repositories'
import type {
  ApprovalConnectorReadModel,
  MockCloseGuardianConnector,
} from './connector-types'

export const approvalConnector: MockCloseGuardianConnector<ApprovalConnectorReadModel> = {
  descriptor: {
    id: 'mock-controller-approvals',
    displayName: 'Controller Approval Connector',
    systemType: 'approval',
    sourceSystem: 'Controller Office',
    description:
      'Mock connector representing controller approval queue state for governed close actions.',
    status: 'available',
    operations: [
      {
        id: 'list_approval_requests',
        displayName: 'List approval requests',
        description: 'Read current in-memory approval request state.',
        mode: 'read',
      },
      {
        id: 'list_approval_policy_evidence',
        displayName: 'List approval policy evidence',
        description: 'Read seeded policy evidence supporting approval boundaries.',
        mode: 'read',
      },
    ],
    suppliedContext: [
      'ApprovalRequest',
      'approval policy evidence',
      'controller review state',
    ],
  },
  health: () => ({
    status: 'available',
    summary: 'Mock approval connector is serving in-memory controller review state.',
    checkedAt: new Date().toISOString(),
  }),
  read: () => ({
    approvalRequests: listApprovals().approvalRequests,
    evidenceItems: demoScenario.evidenceItems.filter((evidence) =>
      evidence.tags.includes('approval-policy'),
    ),
  }),
}
