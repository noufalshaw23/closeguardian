import { demoScenario } from '../data'
import type {
  MockCloseGuardianConnector,
  SchedulerConnectorReadModel,
} from './connector-types'

export const schedulerConnector: MockCloseGuardianConnector<SchedulerConnectorReadModel> = {
  descriptor: {
    id: 'mock-finance-scheduler',
    displayName: 'Finance Scheduler Connector',
    systemType: 'scheduler',
    sourceSystem: 'FinanceScheduler',
    description:
      'Mock connector representing scheduled close job state and related service dependencies.',
    status: 'available',
    operations: [
      {
        id: 'list_scheduled_jobs',
        displayName: 'List scheduled jobs',
        description: 'Read seeded scheduled job records for the close period.',
        mode: 'read',
      },
      {
        id: 'list_job_dependencies',
        displayName: 'List job dependencies',
        description: 'Read seeded service dependencies used by scheduled jobs.',
        mode: 'read',
      },
    ],
    suppliedContext: [
      'ScheduledJob',
      'ServiceDependency',
      'run log evidence',
      'image evidence placeholder',
    ],
  },
  health: () => ({
    status: 'available',
    summary: 'Mock scheduler connector is serving seeded failed job data.',
    checkedAt: demoScenario.generatedAt,
  }),
  read: () => ({
    jobs: demoScenario.scheduledJobs,
    dependencies: demoScenario.serviceDependencies,
    evidenceItems: demoScenario.evidenceItems.filter((evidence) =>
      evidence.tags.includes('scheduled-job'),
    ),
  }),
}
