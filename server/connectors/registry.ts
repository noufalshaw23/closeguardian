import { approvalConnector } from './approval-connector'
import { incidentConnector } from './incident-connector'
import { metadataConnector } from './metadata-connector'
import { schedulerConnector } from './scheduler-connector'
import type {
  ConnectorCapabilitySummary,
  ConnectorRegistryResponse,
  MockCloseGuardianConnector,
} from './connector-types'

const connectors: MockCloseGuardianConnector<unknown>[] = [
  schedulerConnector,
  metadataConnector,
  incidentConnector,
  approvalConnector,
]

export function listConnectorCapabilities(): ConnectorRegistryResponse {
  return {
    connectors: connectors.map(toCapabilitySummary),
  }
}

export function listConnectors(): MockCloseGuardianConnector<unknown>[] {
  return connectors
}

function toCapabilitySummary(
  connector: MockCloseGuardianConnector<unknown>,
): ConnectorCapabilitySummary {
  return {
    connector: connector.descriptor,
    health: connector.health(),
  }
}
