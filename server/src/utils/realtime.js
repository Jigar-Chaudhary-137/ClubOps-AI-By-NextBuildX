/**
 * Native Server-Sent Events (SSE) Real-Time Connection Manager
 * Process-local in-memory architecture for live event operations and notification streaming.
 */

// Central connection registry
const activeConnections = new Map(); // connId -> { id, userId, clubId, eventId, res, heartbeatTimer, connectedAt }
const userConnections = new Map();   // userId -> Set<connId>
const clubConnections = new Map();   // clubId -> Set<connId>
const eventConnections = new Map();  // eventId -> Set<connId>

let nextConnectionId = 1;

/**
 * Registers an authenticated SSE stream connection.
 * @param {Object} params
 * @param {string|ObjectId} params.userId
 * @param {string|ObjectId} params.clubId
 * @param {string|ObjectId} [params.eventId]
 * @param {import('express').Request} params.req
 * @param {import('express').Response} params.res
 * @returns {string} Connection ID
 */
const addConnection = ({ userId, clubId, eventId = null, req, res }) => {
  const uId = userId.toString();
  const cId = clubId.toString();
  const eId = eventId ? eventId.toString() : null;
  const connId = `sse_${uId}_${nextConnectionId++}_${Date.now()}`;

  // 1. Setup SSE Response Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Flush headers immediately if compression middleware is present
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // 2. Setup periodic heartbeat to keep connection alive
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    } catch (err) {
      removeConnection(connId);
    }
  }, 30000);

  // 3. Store connection
  const connObj = {
    id: connId,
    userId: uId,
    clubId: cId,
    eventId: eId,
    res,
    heartbeatTimer,
    connectedAt: new Date()
  };

  activeConnections.set(connId, connObj);

  // Index by User
  if (!userConnections.has(uId)) userConnections.set(uId, new Set());
  userConnections.get(uId).add(connId);

  // Index by Club
  if (!clubConnections.has(cId)) clubConnections.set(cId, new Set());
  clubConnections.get(cId).add(connId);

  // Index by Event
  if (eId) {
    if (!eventConnections.has(eId)) eventConnections.set(eId, new Set());
    eventConnections.get(eId).add(connId);
  }

  // 4. Send initial connection greeting
  res.write(
    `event: connected\ndata: ${JSON.stringify({
      status: 'connected',
      connectionId: connId,
      userId: uId,
      clubId: cId,
      eventId: eId,
      timestamp: new Date().toISOString()
    })}\n\n`
  );

  console.log(`[SSE] Client connected: user=${uId} club=${cId} connId=${connId} activeTotal=${activeConnections.size}`);

  // 5. Clean up on disconnect
  const cleanup = () => removeConnection(connId);
  req.on('close', cleanup);
  res.on('close', cleanup);
  res.on('finish', cleanup);
  res.on('error', cleanup);

  return connId;
};

/**
 * Removes and cleans up an SSE connection.
 * @param {string} connId 
 */
const removeConnection = (connId) => {
  const conn = activeConnections.get(connId);
  if (!conn) return;

  // Clear heartbeat
  if (conn.heartbeatTimer) {
    clearInterval(conn.heartbeatTimer);
  }

  // Clean indexes
  if (userConnections.has(conn.userId)) {
    userConnections.get(conn.userId).delete(connId);
    if (userConnections.get(conn.userId).size === 0) {
      userConnections.delete(conn.userId);
    }
  }

  if (clubConnections.has(conn.clubId)) {
    clubConnections.get(conn.clubId).delete(connId);
    if (clubConnections.get(conn.clubId).size === 0) {
      clubConnections.delete(conn.clubId);
    }
  }

  if (conn.eventId && eventConnections.has(conn.eventId)) {
    eventConnections.get(conn.eventId).delete(connId);
    if (eventConnections.get(conn.eventId).size === 0) {
      eventConnections.delete(conn.eventId);
    }
  }

  activeConnections.delete(connId);
  console.log(`[SSE] Client disconnected: connId=${connId} activeTotal=${activeConnections.size}`);
};

/**
 * Emits an SSE event to all active sockets of a specific user.
 * @param {string|ObjectId} userId 
 * @param {string} eventName 
 * @param {Object} payload 
 */
const sendToUser = (userId, eventName, payload) => {
  const uId = userId ? userId.toString() : null;
  if (!uId || !userConnections.has(uId)) return false;

  const connIds = userConnections.get(uId);
  const dataString = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const connId of connIds) {
    const conn = activeConnections.get(connId);
    if (conn && conn.res && !conn.res.writableEnded) {
      try {
        conn.res.write(dataString);
      } catch (err) {
        removeConnection(connId);
      }
    }
  }
  return true;
};

/**
 * Emits an SSE event to all active sockets of a club.
 * @param {string|ObjectId} clubId 
 * @param {string} eventName 
 * @param {Object} payload 
 */
const sendToClub = (clubId, eventName, payload) => {
  const cId = clubId ? clubId.toString() : null;
  if (!cId || !clubConnections.has(cId)) return false;

  const connIds = clubConnections.get(cId);
  const dataString = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const connId of connIds) {
    const conn = activeConnections.get(connId);
    if (conn && conn.res && !conn.res.writableEnded) {
      try {
        conn.res.write(dataString);
      } catch (err) {
        removeConnection(connId);
      }
    }
  }
  return true;
};

/**
 * Emits an SSE event to all active sockets listening to a specific event.
 * @param {string|ObjectId} eventId 
 * @param {string} eventName 
 * @param {Object} payload 
 */
const sendToEvent = (eventId, eventName, payload) => {
  const eId = eventId ? eventId.toString() : null;
  if (!eId || !eventConnections.has(eId)) return false;

  const connIds = eventConnections.get(eId);
  const dataString = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

  for (const connId of connIds) {
    const conn = activeConnections.get(connId);
    if (conn && conn.res && !conn.res.writableEnded) {
      try {
        conn.res.write(dataString);
      } catch (err) {
        removeConnection(connId);
      }
    }
  }
  return true;
};

/**
 * Formats and broadcasts an application notification through real-time channels.
 * @param {Object} notification - Mongoose Notification document or plain object
 */
const broadcastNotification = (notification) => {
  if (!notification || !notification.recipient) return;

  const payload = {
    id: notification._id ? notification._id.toString() : notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    priority: notification.priority || 'normal',
    read: Boolean(notification.read),
    eventId: notification.event ? notification.event.toString() : null,
    actionUrl: notification.actionUrl || null,
    metadata: notification.metadata || {},
    createdAt: notification.createdAt || new Date().toISOString()
  };

  // 1. Deliver direct notification to recipient
  sendToUser(notification.recipient, 'notification', payload);

  // 2. If it's a domain operational event, also deliver targeted room updates
  if (notification.type === 'task_assigned' || notification.type === 'task_updated') {
    if (notification.event) {
      sendToEvent(notification.event, 'task.updated', payload);
    }
  } else if (notification.type === 'risk_critical') {
    sendToClub(notification.club, 'risk.critical', payload);
    if (notification.event) {
      sendToEvent(notification.event, 'risk.critical', payload);
    }
  } else if (notification.type === 'announcement_broadcast') {
    sendToClub(notification.club, 'announcement.broadcast', payload);
    if (notification.event) {
      sendToEvent(notification.event, 'announcement.broadcast', payload);
    }
  } else if (notification.type === 'meeting_action') {
    sendToUser(notification.recipient, 'meeting.action', payload);
  }
};

/**
 * Returns connection metrics for observability and testing.
 */
const getStats = () => {
  return {
    totalConnections: activeConnections.size,
    uniqueUsers: userConnections.size,
    uniqueClubs: clubConnections.size,
    uniqueEvents: eventConnections.size
  };
};

module.exports = {
  addConnection,
  removeConnection,
  sendToUser,
  sendToClub,
  sendToEvent,
  broadcastNotification,
  getStats
};
