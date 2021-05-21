/* global ch */

// Delete cookie
document.cookie = '_ch=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

window.ch = function () {
  // eslint-disable-next-line prefer-rest-params
  (ch.q = ch.q || []).push(arguments);
};

window.ch('config', {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123_QUEUED'
});

// This is needed...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const process = {
  env: {
    // NODE_ENV: 'production'
  }
};
