/* global ch */

// Delete cookie
document.cookie = '_ch=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

// eslint-disable-next-line
window.ch = (...args) => (ch.q = ch.q || []).push(args);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
window.ch('config', {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123_QUEUED'
});

// This is needed...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const process = {env: {}};
