import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocumentPermissionPolicy, evaluateDocumentPermission } from '../dist/esm/index.js';

test('default deny, explicit grants, wildcards, owner and deny precedence are explicit', () => {
  const policy = createDocumentPermissionPolicy({
    owner: 'owner',
    grants: [
      { principal: '*', actions: ['read'] },
      { principal: 'editor', actions: ['edit'] },
    ],
    denies: [{ principal: 'editor', actions: ['edit'] }],
  });
  assert.deepEqual(evaluateDocumentPermission(policy, 'owner', 'delete'), {
    allowed: true,
    reason: 'owner',
  });
  assert.deepEqual(evaluateDocumentPermission(policy, 'guest', 'read'), {
    allowed: true,
    reason: 'explicit-grant',
  });
  assert.deepEqual(evaluateDocumentPermission(policy, 'editor', 'edit'), {
    allowed: false,
    reason: 'explicit-deny',
  });
  assert.deepEqual(evaluateDocumentPermission(policy, 'guest', 'delete'), {
    allowed: false,
    reason: 'default-deny',
  });
});

test('explicit default allow is advisory and distinguishable from grants', () => {
  assert.deepEqual(evaluateDocumentPermission({ defaultEffect: 'allow' }, 'reader', 'export'), {
    allowed: true,
    reason: 'default-allow',
  });
});

test('invalid actions, identities and oversized policies are rejected', () => {
  assert.throws(() => evaluateDocumentPermission({}, '', 'read'), /Principal/);
  assert.throws(() => evaluateDocumentPermission({}, 'x', 'execute'), /Unknown/);
  assert.throws(() => createDocumentPermissionPolicy({ defaultEffect: 'maybe' }), /defaultEffect/);
  assert.throws(
    () => createDocumentPermissionPolicy({ grants: [{ principal: 'x', actions: [] }] }),
    /at least one/,
  );
});
