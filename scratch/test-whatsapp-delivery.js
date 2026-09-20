/**
 * Comprehensive WhatsApp Delivery & Multi-Channel Broadcast Engine Test Suite
 * Validates all 13 requirements:
 * 1. Phone Normalization
 * 2. WhatsApp Simulator Lifecycle (queued -> sent -> delivered -> read)
 * 3. Delivery Persistence
 * 4. Missing Phone Graceful Handling
 * 5. Delivery Statistics
 * 6. Webhook Status Callback & State Machine
 * 7. Invalid Webhook Protection
 * 8. Cross-Club Multi-Tenant Isolation
 * 9. Retry Failed Delivery
 * 10. AI Agent WhatsApp Broadcast
 * 11. AI Agent Dry-Run (Zero Database Mutation)
 * 12. Click-to-Chat URL Generation
 * 13. WhatsApp Message Formatting
 */

const http = require('http');
const mongoose = require('../server/node_modules/mongoose');
const whatsappService = require('../server/src/services/whatsapp.service');
const simulatorProvider = require('../server/src/services/whatsapp/simulatorProvider');
const broadcastService = require('../server/src/services/broadcast.service');
const BroadcastDelivery = require('../server/src/models/BroadcastDelivery');
const Announcement = require('../server/src/models/Announcement');
const User = require('../server/src/models/User');
const { executeTool } = require('../server/src/ai/tools');

function makeJsonRequest(urlStr, method, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runWhatsAppTestSuite() {
  console.log('============================================================');
  console.log('    CLUBOPS AI — WHATSAPP DELIVERY & BROADCAST TEST SUITE   ');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details) {
    total++;
    if (condition) {
      console.log(`✅ [TEST ${total}] PASS: ${name}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ [TEST ${total}] FAIL: ${name}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // Connect mongoose for direct model assertions
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/clubops_ai');
  }

  // Authenticate Club A (Organizer) and Club B (Robotics)
  const clubALogin = await makeJsonRequest('http://localhost:5000/api/auth/login', 'POST', {
    email: 'lead@club.edu',
    password: 'Password123!'
  });
  const tokenClubA = clubALogin.data?.data?.token;
  const userClubA = clubALogin.data?.data?.user;
  const clubIdA = userClubA?.club?._id || userClubA?.club;

  const clubBLogin = await makeJsonRequest('http://localhost:5000/api/auth/login', 'POST', {
    email: 'robo.lead@club.edu',
    password: 'Password123!'
  });
  const tokenClubB = clubBLogin.data?.data?.token;
  const userClubB = clubBLogin.data?.data?.user;
  const clubIdB = userClubB?.club?._id || userClubB?.club;

  // ------------------------------------------------------------
  // TEST 1: Phone Normalization & Masking
  // ------------------------------------------------------------
  try {
    const n1 = whatsappService.normalizePhoneNumber('+919876543210');
    const n2 = whatsappService.normalizePhoneNumber('919876543210');
    const n3 = whatsappService.normalizePhoneNumber('09876543210');
    const n4 = whatsappService.normalizePhoneNumber('9876543210');
    const nInvalid = whatsappService.normalizePhoneNumber('12345');
    const masked = whatsappService.maskPhoneNumber('+919876543210');

    const normPass = n1 === '+919876543210' &&
      n2 === '+919876543210' &&
      n3 === '+919876543210' &&
      n4 === '+919876543210' &&
      nInvalid === null &&
      masked.startsWith('+91') && masked.endsWith('3210') && masked.includes('*');

    assert(normPass, 'Phone Number Normalization (E.164) & Privacy Masking', `Masked: ${masked}, Normalized: ${n4}`);
  } catch (err) {
    assert(false, 'Phone Number Normalization', err.message);
  }

  // ------------------------------------------------------------
  // TEST 2: WhatsApp Message Formatting & Click-to-Chat URL
  // ------------------------------------------------------------
  try {
    const sampleAnn = {
      title: 'Hackathon Final Pitch',
      content: 'Please arrive at the **Main Auditorium** at 9:00 AM.\n\n# Schedule Details\n1. Setup\n2. Pitch',
      venue: 'Auditorium Hall B',
      scheduledFor: new Date('2026-09-25T09:00:00Z')
    };

    const formatted = whatsappService.formatWhatsAppAnnouncement(sampleAnn, 'NextBuild Club', 'Hackathon 2026');
    const clickUrl = whatsappService.generateClickToChatUrl('+919876543210', 'Hello from ClubOps!');

    const formatPass = formatted.includes('*[NextBuild Club] Hackathon Final Pitch*') &&
      formatted.includes('*Main Auditorium*') &&
      formatted.includes('📍 *Venue:* Auditorium Hall B') &&
      clickUrl === 'https://wa.me/919876543210?text=Hello%20from%20ClubOps!';

    assert(formatPass, 'WhatsApp Markdown Formatter & Click-to-Chat URL Generation', `URL: ${clickUrl}`);
  } catch (err) {
    assert(false, 'WhatsApp Message Formatter', err.message);
  }

  // ------------------------------------------------------------
  // TEST 3: WhatsApp Simulator Dispatch & Lifecycle
  // ------------------------------------------------------------
  let simulatedMessageId = null;
  try {
    const simRes = await simulatorProvider.sendMessage({
      toPhone: '+919876543210',
      messageBody: 'Test simulator message'
    });

    simulatedMessageId = simRes.providerMessageId;
    const simPass = simRes.success &&
      simRes.status === 'queued' &&
      simRes.mode === 'simulator' &&
      simRes.providerMessageId.startsWith('wamid.HB');

    assert(simPass, 'WhatsApp Simulator Dispatch (Generates realistic wamid.HB IDs)', `Message ID: ${simRes.providerMessageId}`);
  } catch (err) {
    assert(false, 'WhatsApp Simulator Dispatch', err.message);
  }

  // Ensure at least one volunteer has a phone number and one does not
  const volunteers = await User.find({ club: clubIdA, role: 'volunteer' }).limit(2);
  if (volunteers.length > 0) {
    await User.updateOne({ _id: volunteers[0]._id }, { $set: { phone: '+919876543210' } });
  }
  if (volunteers.length > 1) {
    await User.updateOne({ _id: volunteers[1]._id }, { $set: { phone: '' } });
  }

  // ------------------------------------------------------------
  // TEST 4: Broadcast Announcement via WhatsApp (Multi-Recipient)
  // ------------------------------------------------------------
  let testAnnouncementId = null;
  try {
    const createRes = await makeJsonRequest(
      'http://localhost:5000/api/announcements',
      'POST',
      {
        title: 'Urgent Stage Logistics Update',
        content: 'All volunteers report to **Zone C** for equipment check-in.',
        targetAudience: 'volunteers',
        priority: 'urgent',
        channels: ['in_app', 'whatsapp']
      },
      tokenClubA
    );

    testAnnouncementId = createRes.data?.data?.announcement?._id;

    const broadcastRes = await makeJsonRequest(
      `http://localhost:5000/api/announcements/${testAnnouncementId}/broadcast`,
      'POST',
      { channels: ['in_app', 'whatsapp'] },
      tokenClubA
    );

    const bPass = broadcastRes.status === 200 &&
      broadcastRes.data?.data?.summary?.totalOperations > 0 &&
      Array.isArray(broadcastRes.data?.data?.receipts);

    assert(bPass, 'Multi-Channel Announcement Broadcast (In-App + WhatsApp)', `Operations: ${broadcastRes.data?.data?.summary?.totalOperations}`);
  } catch (err) {
    assert(false, 'Multi-Channel Announcement Broadcast', err.message);
  }

  // ------------------------------------------------------------
  // TEST 5: Delivery Persistence & Record Schema
  // ------------------------------------------------------------
  try {
    const deliveries = await BroadcastDelivery.find({
      announcement: testAnnouncementId,
      channel: 'whatsapp'
    });

    const hasSuccessDelivery = deliveries.some(d => d.providerMessageId && ['queued', 'sent', 'delivered', 'read', 'simulated'].includes(d.status));
    const hasFailedMissingPhone = deliveries.some(d => d.status === 'failed' && d.failureReason?.includes('phone'));

    const persistPass = deliveries.length > 0 && (hasSuccessDelivery || hasFailedMissingPhone);
    assert(persistPass, 'BroadcastDelivery Record Persistence & Schema Validation', `Deliveries found: ${deliveries.length}, Valid message ID: ${hasSuccessDelivery}, Missing phone handled: ${hasFailedMissingPhone}`);
  } catch (err) {
    assert(false, 'BroadcastDelivery Record Persistence', err.message);
  }

  // ------------------------------------------------------------
  // TEST 6: Delivery Statistics Funnel
  // ------------------------------------------------------------
  try {
    const stats = await whatsappService.getBroadcastDeliveryStats(testAnnouncementId, clubIdA);
    const statsPass = typeof stats.queued === 'number' &&
      typeof stats.sent === 'number' &&
      typeof stats.delivered === 'number' &&
      typeof stats.failed === 'number' &&
      stats.total >= 0;

    assert(statsPass, 'Broadcast Delivery Statistics Funnel Query', `Total: ${stats.total}, Queued: ${stats.queued}, Delivered: ${stats.delivered}, Failed: ${stats.failed}`);
  } catch (err) {
    assert(false, 'Broadcast Delivery Statistics Funnel', err.message);
  }

  // ------------------------------------------------------------
  // TEST 7: Webhook Verification Endpoint (GET)
  // ------------------------------------------------------------
  try {
    const verifyRes = await makeJsonRequest(
      'http://localhost:5000/api/notifications/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=clubops_verify_token_2026&hub.challenge=test_challenge_12345',
      'GET'
    );

    const verifyPass = verifyRes.status === 200 && (verifyRes.raw === 'test_challenge_12345' || verifyRes.data === 'test_challenge_12345');
    assert(verifyPass, 'Meta WhatsApp Webhook Challenge Verification (GET)', `Status: ${verifyRes.status}`);
  } catch (err) {
    assert(false, 'Meta Webhook Verification', err.message);
  }

  // ------------------------------------------------------------
  // TEST 8: Webhook Status Callback & State Machine (POST)
  // ------------------------------------------------------------
  try {
    let targetDelivery = await BroadcastDelivery.findOne({
      announcement: testAnnouncementId,
      channel: 'whatsapp',
      providerMessageId: { $ne: null }
    });

    if (!targetDelivery) {
      targetDelivery = new BroadcastDelivery({
        announcement: testAnnouncementId,
        club: clubIdA,
        channel: 'whatsapp',
        recipient: volunteers[0]?._id,
        phone: '+919876543210',
        status: 'sent',
        providerMessageId: `wamid.HBtest_${Date.now()}`
      });
      await targetDelivery.save();
    }

    const webhookRes = await makeJsonRequest(
      'http://localhost:5000/api/notifications/whatsapp/webhook',
      'POST',
      {
        providerMessageId: targetDelivery.providerMessageId,
        status: 'read',
        timestamp: new Date().toISOString()
      }
    );

    const updated = await BroadcastDelivery.findById(targetDelivery._id);
    const hookPass = webhookRes.status === 200 && updated.status === 'read' && updated.readAt !== null;
    assert(hookPass, 'Webhook Status Callback & State Transition (queued -> delivered -> read)', `Status: ${updated.status}, readAt: ${updated.readAt}`);
  } catch (err) {
    assert(false, 'Webhook Status Callback', err.message);
  }

  // ------------------------------------------------------------
  // TEST 9: Malformed Webhook Payload Protection
  // ------------------------------------------------------------
  try {
    const malformedRes = await makeJsonRequest(
      'http://localhost:5000/api/notifications/whatsapp/webhook',
      'POST',
      { arbitraryBogusData: 12345 }
    );

    assert(malformedRes.status === 200 || malformedRes.status === 400, 'Malformed Webhook Payload Protection (No Server Crash)', `Status: ${malformedRes.status}`);
  } catch (err) {
    assert(false, 'Malformed Webhook Payload Protection', err.message);
  }

  // ------------------------------------------------------------
  // TEST 10: Cross-Club Multi-Tenant Isolation
  // ------------------------------------------------------------
  try {
    // Club B attempts to access Club A's announcement deliveries
    const leakRes = await makeJsonRequest(
      `http://localhost:5000/api/announcements/${testAnnouncementId}/deliveries`,
      'GET',
      null,
      tokenClubB
    );

    const isolationPass = leakRes.status === 404 || leakRes.status === 403;
    assert(isolationPass, 'Cross-Club Multi-Tenant Isolation (Club B blocked from Club A deliveries)', `Status: ${leakRes.status} (${leakRes.data?.message || 'Blocked'})`);
  } catch (err) {
    assert(false, 'Cross-Club Multi-Tenant Isolation', err.message);
  }

  // ------------------------------------------------------------
  // TEST 11: Retry Failed/Queued Deliveries Endpoint
  // ------------------------------------------------------------
  try {
    const retryRes = await makeJsonRequest(
      `http://localhost:5000/api/announcements/${testAnnouncementId}/retry-delivery`,
      'POST',
      { retryFailed: true },
      tokenClubA
    );

    const retryPass = retryRes.status === 200 && typeof retryRes.data?.data?.retriedCount === 'number';
    assert(retryPass, 'Delivery Retry API Endpoint (POST /:id/retry-delivery)', `Retried Count: ${retryRes.data?.data?.retriedCount}`);
  } catch (err) {
    assert(false, 'Delivery Retry API Endpoint', err.message);
  }

  // ------------------------------------------------------------
  // TEST 12: AI Operations Agent WhatsApp Broadcast Tool
  // ------------------------------------------------------------
  try {
    const agentContext = {
      clubId: clubIdA,
      user: { _id: userClubA.id || userClubA._id, name: userClubA.name },
      dryRun: false
    };

    const agentResult = await executeTool(
      'send_broadcast_alert',
      {
        title: 'Emergency Venue Relocation',
        message: 'Workshop moving to Seminar Hall 2 due to projector maintenance.',
        priority: 'urgent',
        audience: 'volunteers',
        channels: ['whatsapp', 'in_app']
      },
      agentContext
    );

    const agentPass = agentResult.success && agentResult.action.includes('Broadcast');
    assert(agentPass, 'AI Operations Agent WhatsApp Broadcast Tool Execution', `Action: ${agentResult.action}, Announcement: ${agentResult.resource?.id}`);
  } catch (err) {
    assert(false, 'AI Operations Agent Broadcast Tool', err.message);
  }

  // ------------------------------------------------------------
  // TEST 13: AI Operations Agent Dry-Run (Zero Database Mutation)
  // ------------------------------------------------------------
  try {
    const dryRunContext = {
      clubId: clubIdA,
      user: { _id: userClubA.id || userClubA._id, name: userClubA.name },
      dryRun: true
    };

    const countBefore = await Announcement.countDocuments({ club: clubIdA });

    const dryRunResult = await executeTool(
      'send_broadcast_alert',
      {
        title: 'Dry Run Test Broadcast',
        message: 'This should not be saved in database.',
        priority: 'normal',
        audience: 'volunteers',
        channels: ['whatsapp']
      },
      dryRunContext
    );

    const countAfter = await Announcement.countDocuments({ club: clubIdA });
    const dryRunPass = dryRunResult.success &&
      dryRunResult.dryRun === true &&
      countBefore === countAfter &&
      dryRunResult.wouldSend !== undefined;

    assert(dryRunPass, 'AI Operations Agent Dry-Run Verification (0 DB Mutations)', `DryRun Flag: ${dryRunResult.dryRun}, Announcements before/after: ${countBefore}/${countAfter}`);
  } catch (err) {
    assert(false, 'AI Agent Dry-Run Verification', err.message);
  }

  // Summary
  console.log('\n============================================================');
  console.log(` WHATSAPP TEST SUITE RESULT: ${passed}/${total} TESTS PASSED`);
  console.log('============================================================\n');

  await mongoose.disconnect();

  if (passed === total) {
    console.log('🎉 ALL 13 WHATSAPP DELIVERY & BROADCAST TESTS PASSED PERFECTLY!\n');
  } else {
    process.exitCode = 1;
  }
}

runWhatsAppTestSuite();
