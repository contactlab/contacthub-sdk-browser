// Delete cookie
document.cookie = '_ch=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

/* global ch */
window.ch = function() { (ch.q = ch.q || []).push(arguments); };

window.ch('config', {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123_QUEUED'
});
