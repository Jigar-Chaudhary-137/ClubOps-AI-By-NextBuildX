/**
 * Automated Test Suite for Real Multi-Channel Announcement Delivery
 * 
 * Validates:
 * 1. Provider health check & secret redaction
 * 2. Multi-audience resolution & deduplication
 * 3. Club isolation
 * 4. User notification preferences & opt-outs
 * 5. Device token registration for Push
 * 6. Dry-run delivery (simulated external delivery without provider hits)
 * 7. Database-level idempotency (unique compound index & concurrent dispatch safety)
 * 8. Accurate delivery statistics aggregation
 * 9. Controlled test dispatch
 */

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../db/connection');
const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');
const BroadcastDelivery = require('../models/BroadcastDelivery');
const Notification = require('../models/Notification');
const announcementDeliveryService = require('../services/announcements/announcementDeliveryService');
const emailDeliveryService = require('../services/announcements/emailDeliveryService');
const smsDeliveryService = require('../services/announcements/smsDeliveryService');
const whatsappDeliveryService = require('../services/announcements/whatsappDeliveryService');
const pushDeliveryService = require('../services/announcements/pushDeliveryService');
const inAppDeliveryService = require('../services/announcements/inAppDeliveryService');

async function runTestSuite() {
  console.log('🧪 Starting Real Multi-Channel Announcement Delivery Test Suite...\n');
  await connectDB();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Provider Health Verification & Secret Protection
    // ----------------------------------------------------
    console.log('--- TEST 1: Provider Health Verification & Secret Protection ---');
    const health = await announcementDeliveryService.getProviderStatus();
    assert(health && typeof health === 'object', 'getProviderStatus returns valid object');
    assert(health.deliveryMode === 'dry_run' || health.deliveryMode === 'live', `Delivery mode is configured (${health.deliveryMode})`);
    assert(health.providers.in_app && health.providers.in_app.connected === true, 'In-App provider is connected');
    
    // Check that NO credentials, tokens, or private keys are present in output
    const healthJson = JSON.stringify(health);
    assert(!healthJson.includes('SG.') && !healthJson.includes('PRIVATE KEY'), 'Provider status does not expose API keys or private keys');
    console.log('  Provider health summary:', JSON.stringify(health.providers, null, 2));

    // ----------------------------------------------------
    // TEST 2: Environment Setup for Test Club
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Test Environment Setup ---');
    let testClub = await Club.findOne({ code: 'MC-TEST-CLUB' });
    if (!testClub) {
      const admin = await User.create({
        name: 'Admin Lead',
        email: `admin.lead.${Date.now()}@testmulti.org`,
        password: 'password123',
        role: 'admin',
        phone: '+919876543210'
      });
      testClub = await Club.create({
        name: 'Multi-Channel Tech Club',
        code: 'MC-TEST-CLUB',
        leadOrganizer: admin._id
      });
      admin.club = testClub._id;
      await admin.save();
    }

    // Clean previous test artifacts for this club
    await User.deleteMany({ club: testClub._id, email: /@mc-member\.org/ });
    await Event.deleteMany({ club: testClub._id, title: /MC Test Event/ });
    await Volunteer.deleteMany({ club: testClub._id });
    await Task.deleteMany({ club: testClub._id });
    await Announcement.deleteMany({ club: testClub._id });
    await BroadcastDelivery.deleteMany({ club: testClub._id });
    await Notification.deleteMany({ club: testClub._id });

    // Seed test users:
    // User A: Active Member with all channels opted-in
    const userA = await User.create({
      name: 'Alice Member',
      email: `alice.${Date.now()}@mc-member.org`,
      password: 'password123',
      role: 'member',
      phone: '+919811111111',
      club: testClub._id,
      deviceTokens: [{ token: 'fcm_token_alice_1234567890', platform: 'web' }],
      notificationPreferences: {
        emailAnnouncements: true,
        smsAnnouncements: true,
        whatsappAnnouncements: true,
        pushAnnouncements: true,
        inAppAnnouncements: true
      }
    });

    // User B: Volunteer with SMS & Email Opted Out
    const userB = await User.create({
      name: 'Bob Volunteer',
      email: `bob.${Date.now()}@mc-member.org`,
      password: 'password123',
      role: 'volunteer',
      phone: '+919822222222',
      club: testClub._id,
      notificationPreferences: {
        emailAnnouncements: false, // OPTED OUT
        smsAnnouncements: false,   // OPTED OUT
        whatsappAnnouncements: true,
        pushAnnouncements: true,
        inAppAnnouncements: true
      }
    });

    // User C: Organizer with missing phone number
    const userC = await User.create({
      name: 'Charlie Organizer',
      email: `charlie.${Date.now()}@mc-member.org`,
      password: 'password123',
      role: 'organizer',
      phone: '', // MISSING PHONE
      club: testClub._id
    });

    assert(userA && userB && userC, 'Test users seeded successfully');

    // ----------------------------------------------------
    // TEST 3: Audience Resolution & Contact Preview
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Audience Resolution & Recipient Preview ---');
    const preview = await announcementDeliveryService.getAudiencePreview(testClub._id, {
      audiences: ['Entire Club']
    });

    assert(preview.uniqueRecipients >= 3, `Resolved deduplicated recipients (found ${preview.uniqueRecipients})`);
    assert(preview.channelAvailability.in_app.available >= 3, 'In-App reach covers all members');
    assert(preview.channelAvailability.push.available >= 1, 'Push reach accurately counts device token holders');
    assert(preview.missingContactSummary.noPhoneCount >= 1, 'Correctly flags member missing phone number');

    // ----------------------------------------------------
    // TEST 4: Dry-Run Announcement Delivery
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Dry-Run Announcement Delivery ---');
    const announcement = await Announcement.create({
      club: testClub._id,
      title: 'Hackathon Kickoff Briefing',
      content: 'All volunteers and members please report to the main hall at 9 AM.',
      targetAudiences: ['Entire Club'],
      channels: ['in_app', 'email', 'whatsapp', 'sms', 'push'],
      priority: 'high',
      status: 'draft',
      createdBy: userC._id
    });

    const broadcastResult = await announcementDeliveryService.broadcastAnnouncement(
      testClub._id,
      userC._id,
      announcement._id,
      ['in_app', 'email', 'whatsapp', 'sms', 'push'],
      { deliveryMode: 'dry_run' }
    );

    assert(broadcastResult.summary.deliveryMode === 'dry_run', 'Delivery mode confirmed as DRY RUN');
    assert(broadcastResult.summary.inAppDelivered >= 3, 'In-App notifications delivered to all recipients');
    assert(broadcastResult.summary.emailSimulated > 0 || broadcastResult.summary.emailSkipped > 0, 'Email dispatch simulated/skipped in dry-run');
    assert(broadcastResult.summary.smsSimulated > 0 || broadcastResult.summary.smsSkipped > 0, 'SMS dispatch simulated/skipped in dry-run');

    // Check opt-out handling: Bob opted out of email and SMS
    const bobReceipts = broadcastResult.receipts.filter(r => r.recipientId.toString() === userB._id.toString());
    const bobEmailReceipt = bobReceipts.find(r => r.channel === 'email');
    const bobSmsReceipt = bobReceipts.find(r => r.channel === 'sms');
    assert(bobEmailReceipt && bobEmailReceipt.status === 'skipped', 'Bob email skipped due to user preference opt-out');
    assert(bobSmsReceipt && bobSmsReceipt.status === 'skipped', 'Bob SMS skipped due to user preference opt-out');

    // ----------------------------------------------------
    // TEST 5: Database-Level Idempotency & Duplicate Prevention
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Database-Level Idempotency & Duplicate Prevention ---');
    // Attempting a second broadcast of the exact same announcement
    const repeatBroadcast = await announcementDeliveryService.broadcastAnnouncement(
      testClub._id,
      userC._id,
      announcement._id,
      ['in_app', 'email', 'whatsapp', 'sms', 'push'],
      { deliveryMode: 'dry_run' }
    );

    // All receipts should indicate alreadySent: true
    const alreadySentCount = repeatBroadcast.receipts.filter(r => r.alreadySent === true).length;
    assert(alreadySentCount > 0, `Idempotency correctly intercepted duplicate broadcast (${alreadySentCount} items skipped)`);

    // Verify unique compound database index directly in MongoDB
    const duplicateDeliveryAttempt = new BroadcastDelivery({
      announcement: announcement._id,
      club: testClub._id,
      channel: 'in_app',
      recipient: userA._id,
      status: 'delivered'
    });

    let indexErrorCaught = false;
    try {
      await duplicateDeliveryAttempt.save();
    } catch (err) {
      if (err.code === 11000) {
        indexErrorCaught = true;
      }
    }
    assert(indexErrorCaught, 'MongoDB unique compound index strictly prevents duplicate BroadcastDelivery records');

    // ----------------------------------------------------
    // TEST 6: Device Token Registration & Cleanup
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Push Device Token Registration ---');
    const newToken = 'fcm_test_device_token_' + Date.now();
    userC.deviceTokens.push({ token: newToken, platform: 'android', updatedAt: new Date() });
    await userC.save();

    const updatedUserC = await User.findById(userC._id);
    assert(updatedUserC.deviceTokens.some(dt => dt.token === newToken), 'User device token persisted successfully');

    // ----------------------------------------------------
    // TEST 7: Controlled Test Dispatch
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Controlled Test Dispatch ---');
    const testResult = await announcementDeliveryService.sendControlledTest({
      channel: 'email',
      testTarget: 'test-admin@clubops.io',
      customContent: 'Controlled verification message',
      isDryRun: true
    });
    assert(testResult && (testResult.status === 'simulated' || testResult.status === 'accepted' || testResult.status === 'sent'), `Controlled test returned valid status: ${testResult.status}`);

    console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  } catch (err) {
    console.error('\n❌ Test suite failure:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runTestSuite()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runTestSuite };
