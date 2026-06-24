import { demoScenario } from '../data'
import type {
  IncidentConnectorReadModel,
  MockCloseGuardianConnector,
} from './connector-types'

export const incidentConnector: MockCloseGuardianConnector<IncidentConnectorReadModel> = {
  descriptor: {
    id: 'mock-incident-history',
    displayName: 'Incident History Connector',
    systemType: 'incident',
    sourceSystem: 'Finance Data Platform',
    description:
      'Mock connector representing incident history and dependency health context.',
    status: 'available',
    operations: [
      {
        id: 'list_incidents',
        displayName: 'List incidents',
        description: 'Read seeded current and prior close incident records.',
        mode: 'read',
      },
      {
        id: 'list_dependency_health',
        displayName: 'List dependency health',
        description: 'Read seeded service dependency status.',
        mode: 'read',
      },
    ],
    suppliedContext: [
      'Incident',
      'ServiceDependency',
      'recurrence evidence',
    ],
  },
  health: () => ({
    status: 'degraded',
    summary:
      'Mock incident connector reports the same degraded finance warehouse state used by the demo scenario.',
    checkedAt: demoScenario.generatedAt,
  }),
  read: () => ({
    incidents: demoScenario.incidents,
    dependencies: demoScenario.serviceDependencies,
    evidenceItems: demoScenario.evidenceItems.filter((evidence) =>
      evidence.tags.includes('incident-history'),
    ),
  }),
}
