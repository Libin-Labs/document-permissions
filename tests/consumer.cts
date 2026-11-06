import packageExports = require('@lp-labs/document-permissions');
import type {
  DocumentAction,
  DocumentPermissionPolicy,
  PermissionDecision,
} from '@lp-labs/document-permissions';
const runtimeExports: unknown[] = [
  packageExports.createDocumentPermissionPolicy,
  packageExports.evaluateDocumentPermission,
];
type PublicTypes = DocumentAction | DocumentPermissionPolicy | PermissionDecision;
void runtimeExports;
let publicType!: PublicTypes;
void publicType;
