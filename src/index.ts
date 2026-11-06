export type DocumentAction = 'read' | 'annotate' | 'edit' | 'export' | 'share' | 'delete';

export interface DocumentPermissionPolicy {
  defaultEffect?: 'allow' | 'deny';
  grants?: readonly { principal: string; actions: readonly DocumentAction[] }[];
  denies?: readonly { principal: string; actions: readonly DocumentAction[] }[];
  owner?: string;
}

export interface PermissionDecision {
  allowed: boolean;
  reason: 'owner' | 'explicit-grant' | 'explicit-deny' | 'default-allow' | 'default-deny';
}

const ACTIONS = new Set<DocumentAction>(['read', 'annotate', 'edit', 'export', 'share', 'delete']);

function principal(value: string): void {
  if (typeof value !== 'string' || value.length < 1 || value.length > 256)
    throw new TypeError('Principal must contain 1 to 256 characters.');
}

function normalize(policy: DocumentPermissionPolicy): DocumentPermissionPolicy {
  if (!policy || typeof policy !== 'object')
    throw new TypeError('A permission policy is required.');
  if (
    policy.defaultEffect !== undefined &&
    policy.defaultEffect !== 'allow' &&
    policy.defaultEffect !== 'deny'
  )
    throw new TypeError('defaultEffect must be allow or deny.');
  if (policy.owner !== undefined) principal(policy.owner);
  const copy = (rules: DocumentPermissionPolicy['grants']) => {
    if ((rules?.length ?? 0) > 10_000)
      throw new RangeError('A policy can contain at most 10000 rules.');
    return (rules ?? []).map((rule) => {
      principal(rule.principal);
      if (!Array.isArray(rule.actions) || !rule.actions.length)
        throw new TypeError('Each rule requires at least one action.');
      const actions = [...new Set(rule.actions)];
      if (actions.some((action) => !ACTIONS.has(action)))
        throw new TypeError('Unknown document action.');
      return Object.freeze({ principal: rule.principal, actions: Object.freeze(actions) });
    });
  };
  return Object.freeze({
    defaultEffect: policy.defaultEffect ?? 'deny',
    ...(policy.owner === undefined ? {} : { owner: policy.owner }),
    grants: Object.freeze(copy(policy.grants)),
    denies: Object.freeze(copy(policy.denies)),
  });
}

export function evaluateDocumentPermission(
  policyInput: DocumentPermissionPolicy,
  actor: string,
  action: DocumentAction,
): PermissionDecision {
  principal(actor);
  if (!ACTIONS.has(action)) throw new TypeError('Unknown document action.');
  const policy = normalize(policyInput);
  if (policy.owner === actor) return Object.freeze({ allowed: true, reason: 'owner' });
  const has = (rules: NonNullable<DocumentPermissionPolicy['grants']>) =>
    rules.some(
      (rule) =>
        (rule.principal === actor || rule.principal === '*') && rule.actions.includes(action),
    );
  if (has(policy.denies!)) return Object.freeze({ allowed: false, reason: 'explicit-deny' });
  if (has(policy.grants!)) return Object.freeze({ allowed: true, reason: 'explicit-grant' });
  const allowed = policy.defaultEffect === 'allow';
  return Object.freeze({ allowed, reason: allowed ? 'default-allow' : 'default-deny' });
}

export function createDocumentPermissionPolicy(
  input: DocumentPermissionPolicy = {},
): DocumentPermissionPolicy {
  return normalize(input);
}
