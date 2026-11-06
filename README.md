# @lp-labs/document-permissions

Small explicit permission-policy evaluator for document actions. Decisions are advisory application
logic; they do not enforce access to a file or act as PDF encryption/DRM.

## Install

```bash
npm install @lp-labs/document-permissions
```

Zero runtime and peer dependencies with ESM, CommonJS, and TypeScript declaration exports.

## Quickstart

```js
import { evaluateDocumentPermission } from '@lp-labs/document-permissions';

const policy = {
  owner: 'alice',
  grants: [{ principal: 'reviewer', actions: ['read', 'annotate'] }],
  denies: [{ principal: 'reviewer', actions: ['export'] }],
};
if (!evaluateDocumentPermission(policy, 'reviewer', 'read').allowed)
  throw new Error('No read grant');
if (evaluateDocumentPermission(policy, 'reviewer', 'export').allowed)
  throw new Error('Export denied');
```

## API and customization

`createDocumentPermissionPolicy(input?)` validates and returns a detached frozen policy.
`evaluateDocumentPermission(policy, actor, action)` returns a frozen `{ allowed, reason }` decision.
Supported actions are `read`, `annotate`, `edit`, `export`, `share`, and `delete`. Rules may name a
principal or `*`; explicit denies take precedence over grants, and an explicitly configured owner
is always allowed. The default effect is deny; set `defaultEffect: 'allow'` only deliberately.
`DocumentAction`, `DocumentPermissionPolicy`, and `PermissionDecision` are TypeScript types.

Principals are nonempty strings up to 256 characters; a policy is bounded to 10,000 rules and
unknown actions reject. The evaluator does not authenticate principal names, resolve groups, inherit
permissions, persist policy, or inspect a document.

## Runtime and scope

Pure synchronous JavaScript; no browser, PDF, crypto, storage, network, or authorization-provider
requirements. Enforcement belongs at every relevant application boundary. These policies cannot
prevent copying or reading already exposed bytes and do not encrypt documents.

## Exports

Runtime: `createDocumentPermissionPolicy`, `evaluateDocumentPermission`.
Types: `DocumentAction`, `DocumentPermissionPolicy`, `PermissionDecision`.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
