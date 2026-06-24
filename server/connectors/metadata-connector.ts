import { demoScenario } from '../data'
import type {
  MetadataConnectorReadModel,
  MockCloseGuardianConnector,
} from './connector-types'

export const metadataConnector: MockCloseGuardianConnector<MetadataConnectorReadModel> = {
  descriptor: {
    id: 'mock-finance-metadata-hub',
    displayName: 'Finance Metadata Hub Connector',
    systemType: 'metadata',
    sourceSystem: 'FinanceMetadataHub',
    description:
      'Mock connector representing product and revenue mapping exceptions from finance metadata.',
    status: 'available',
    operations: [
      {
        id: 'list_metadata_issues',
        displayName: 'List metadata issues',
        description: 'Read seeded metadata blocker records.',
        mode: 'read',
      },
      {
        id: 'list_metadata_evidence',
        displayName: 'List metadata evidence',
        description: 'Read seeded metadata exception evidence.',
        mode: 'read',
      },
    ],
    suppliedContext: [
      'MetadataIssue',
      'metadata exception evidence',
      'product mapping context',
    ],
  },
  health: () => ({
    status: 'available',
    summary: 'Mock metadata connector is serving seeded product mapping exception data.',
    checkedAt: demoScenario.generatedAt,
  }),
  read: () => ({
    metadataIssues: demoScenario.metadataIssues,
    evidenceItems: demoScenario.evidenceItems.filter((evidence) =>
      evidence.tags.includes('metadata'),
    ),
  }),
}
