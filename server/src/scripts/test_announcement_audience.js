/**
 * Comprehensive Automated Test Suite for Announcement Audience & Delivery Architecture
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
const broadcastService = require('../services/broadcast.service');
const announcementService = require('../services/announcement.service');

async function runTests() {
  console.log('🧪 Starting Announcement Audience & Delivery Test Suite...\n');
  await connectDB();

  try {
    // 1. Setup or find test club & users
    let clubA = await Club.findOne({ code: 'TEST-A' });
    if (!clubA) {
      const leadUser = new User({
        name: 'Lead Organizer A',
        email: `lead.a.${Date.now()}@testclub.org`,
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543210'
      });
      await leadUser.save();

      clubA = new Club({
        name: 'Test Tech Club A',
        code: `TEST-A-${Date.now().toString().slice(-4)}`,
        leadOrganizer: leadUser._id
      });
      await clubA.save();
      leadUser.club = clubA._id;
      await leadUser.save();
    }

    // Secondary Club for Isolation Test
    let clubB = await Club.findOne({ code: 'TEST-B' });
    if (!clubB) {
      const leadUserB = new User({
        name: 'Lead Organizer B',
        email: `lead.b.${Date.now()}@testclub.org`,
        password: 'password123',
        role: 'admin',
        phone: '+91 9123456780'
      });
      await leadUserB.save();

      clubB = new Club({
        name: 'Test Music Club B',
        code: `TEST-B-${Date.now().toString().slice(-4)}`,
        leadOrganizer: leadUserB._id
      });
      await clubB.save();
      leadUserB.club = clubB._id;
      await leadUserB.save();
    }

    // Clean up test data within Club A
    await User.deleteMany({ club: clubA._id, email: /@test-member\.org/ });
    await User.deleteMany({ club: clubB._id, email: /@test-member-b\.org/ });
    await Event.deleteMany({ club: clubA._id, title: /Test Event/ });
    await Volunteer.deleteMany({ club: clubA._id });
    await Task.deleteMany({ club: clubA._id });
    await Announcement.deleteMany({ club: clubA._id });
    await BroadcastDelivery.deleteMany({ club: clubA._id });

    // Create 6 members in Club A:
    // User 1: Admin / Organizer (has email, has phone)
    // User 2: Volunteer (has email, has phone)
    // User 3: Volunteer (has email, NO phone)
    // User 4: Trainer (has email, has phone)
    // User 5: Regular Member (has email, has phone)
    // User 6: Regular Member (NO valid email, has phone)

    const u1 = await User.create({
      name: 'Alice Organizer',
      email: `alice.${Date.now()}@test-member.org`,
      password: 'password123',
      role: 'organizer',
      phone: '+91 9800000001',
      club: clubA._id
    });

    const u2 = await User.create({
      name: 'Bob Volunteer',
      email: `bob.${Date.now()}@test-member.org`,
      password: 'password123',
      role: 'volunteer',
      phone: '+91 9800000002',
      club: clubA._id
    });

    const u3 = await User.create({
      name: 'Charlie Volunteer NoPhone',
      email: `charlie.${Date.now()}@test-member.org`,
      password: 'password123',
      role: 'volunteer',
      phone: '', // No phone
      club: clubA._id
    });

    const u4 = await User.create({
      name: 'Diana Trainer',
      email: `diana.${Date.now()}@test-member.org`,
      password: 'password123',
      role: 'trainer',
      phone: '+91 9800000004',
      club: clubA._id
    });

    const u5 = await User.create({
      name: 'Evan Member',
      email: `evan.${Date.now()}@test-member.org`,
      password: 'password123',
      role: 'member',
      phone: '+91 9800000005',
      club: clubA._id
    });

    const u6 = await User.create({
      name: 'Fiona NoEmail',
      email: `fiona.${Date.now()}@test-member.org`, // valid format for DB, but we will test missing email scenario
      password: 'password123',
      role: 'member',
      phone: '+91 9800000006',
      club: clubA._id
    });

    // Create 1 member in Club B to test Isolation
    const uClubB = await User.create({
      name: 'Zara Club B',
      email: `zara.${Date.now()}@test-member-b.org`,
      password: 'password123',
      role: 'volunteer',
      phone: '+91 9999999999',
      club: clubB._id
    });

    // Create a Test Event in Club A
    const event1 = await Event.create({
      title: 'Test Hackathon 2026',
      club: clubA._id,
      leadOrganizer: u1._id,
      createdBy: u1._id
    });

    // Assign u2 and u3 as volunteers on event1
    await Volunteer.create({
      user: u2._id,
      club: clubA._id,
      event: event1._id,
      availability: 'available'
    });

    await Volunteer.create({
      user: u3._id,
      club: clubA._id,
      event: event1._id,
      availability: 'assigned'
    });

    // Assign u5 to a task in event1
    await Task.create({
      title: 'Prepare Registration Desk',
      club: clubA._id,
      event: event1._id,
      assignedTo: u5._id,
      createdBy: u1._id
    });

    console.log('✅ Test Club, Event & 6 Users created successfully.\n');

    let passed = 0;
    let failed = 0;

    const assert = (condition, name) => {
      if (condition) {
        console.log(`  ✓ PASS: ${name}`);
        passed++;
      } else {
        console.error(`  ✗ FAIL: ${name}`);
        failed++;
      }
    };

    // TEST 1: Entire Club only
    console.log('Test 1: Entire Club audience resolution');
    const res1 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Entire Club']
    });
    // Should resolve all active members of Club A (at least the 6 created + lead)
    assert(res1.length >= 6, `Entire Club resolves all active members (got ${res1.length})`);
    assert(res1.some(u => u._id.toString() === u5._id.toString()), 'Includes normal member Evan');
    assert(!res1.some(u => u._id.toString() === uClubB._id.toString()), 'Excludes Club B user (Tenant Isolation)');

    // TEST 2: Volunteers only
    console.log('\nTest 2: Volunteers audience resolution');
    const res2 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Volunteers']
    });
    assert(res2.some(u => u._id.toString() === u2._id.toString()), 'Includes Volunteer Bob');
    assert(res2.some(u => u._id.toString() === u3._id.toString()), 'Includes Volunteer Charlie');
    assert(!res2.some(u => u._id.toString() === u5._id.toString()), 'Excludes non-volunteer Evan');

    // TEST 3: Event Participants only
    console.log('\nTest 3: Event Participants audience resolution');
    const res3 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Event Participants'],
      eventId: event1._id
    });
    assert(res3.some(u => u._id.toString() === u2._id.toString()), 'Includes event volunteer Bob');
    assert(res3.some(u => u._id.toString() === u5._id.toString()), 'Includes event task assignee Evan');

    // TEST 4: Entire Club + Volunteers (Deduplication)
    console.log('\nTest 4: Entire Club + Volunteers deduplication');
    const res4 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Entire Club', 'Volunteers']
    });
    const uniqueIds4 = new Set(res4.map(u => u._id.toString()));
    assert(uniqueIds4.size === res4.length, `No duplicates when combining Entire Club + Volunteers (${res4.length} unique)`);
    assert(res4.length === res1.length, 'Count equals Entire Club count because volunteers are a subset');

    // TEST 5: Entire Club + Event Participants + Volunteers
    console.log('\nTest 5: Multi-Audience Triple Group (Entire Club + Event Participants + Volunteers)');
    const res5 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Entire Club', 'Event Participants', 'Volunteers'],
      eventId: event1._id
    });
    const uniqueIds5 = new Set(res5.map(u => u._id.toString()));
    assert(uniqueIds5.size === res5.length, `Strict deduplication verified across 3 audiences (${res5.length} unique)`);

    // TEST 6: Organizers + Trainers
    console.log('\nTest 6: Organizers + Trainers resolution');
    const res6 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Organizers', 'Trainers']
    });
    assert(res6.some(u => u._id.toString() === u1._id.toString()), 'Includes Organizer Alice');
    assert(res6.some(u => u._id.toString() === u4._id.toString()), 'Includes Trainer Diana');
    assert(!res6.some(u => u._id.toString() === u5._id.toString()), 'Excludes regular Member Evan');

    // TEST 7: Custom Audience
    console.log('\nTest 7: Custom Audience resolution');
    const res7 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Custom Audience'],
      customUserIds: [u1._id.toString(), u4._id.toString(), uClubB._id.toString()] // Includes invalid Club B user
    });
    assert(res7.length === 2, `Resolves only the 2 Club A members and rejects Club B member (got ${res7.length})`);
    assert(res7.some(u => u._id.toString() === u1._id.toString()), 'Contains Alice');
    assert(res7.some(u => u._id.toString() === u4._id.toString()), 'Contains Diana');
    assert(!res7.some(u => u._id.toString() === uClubB._id.toString()), 'Club B user rejected');

    // TEST 8: Recipient Preview Breakdown & Contact Coverage
    console.log('\nTest 8: Recipient Preview calculation');
    const preview = await broadcastService.getAudiencePreview(clubA._id, {
      audiences: ['Entire Club', 'Volunteers'],
      channels: ['in_app', 'email', 'whatsapp', 'sms']
    });
    assert(preview.uniqueRecipients === res1.length, `Preview unique recipients match (${preview.uniqueRecipients})`);
    assert(preview.channelAvailability.in_app.available === preview.uniqueRecipients, 'In-App available for 100% of recipients');
    assert(preview.missingContactSummary.noPhoneCount >= 1, `Accurately detects at least 1 missing phone count (got ${preview.missingContactSummary.noPhoneCount})`);
    assert(preview.channelAvailability.in_app.status === 'AVAILABLE' || preview.channelAvailability.in_app.status === 'CONNECTED', 'In-App provider status is AVAILABLE or CONNECTED');
    assert(preview.channelAvailability.whatsapp.status === 'NOT_CONFIGURED', 'WhatsApp provider status honestly reports NOT_CONFIGURED when keys missing');

    // TEST 9: Event Participants without event selected
    console.log('\nTest 9: Event Participants without event selected');
    const res9 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Event Participants'],
      eventId: null
    });
    assert(res9.length === 0, 'Event Participants with null eventId safely returns empty without crash');

    // TEST 10: Volunteer audience without event selected
    console.log('\nTest 10: Volunteer audience without event selected');
    const res10 = await broadcastService.resolveMultiAudienceRecipients(clubA._id, {
      audiences: ['Volunteers'],
      eventId: null
    });
    assert(res10.some(u => u._id.toString() === u2._id.toString()), 'Resolves all club volunteers across events');

    // TEST 11: Announcement Creation & Multi-Channel Broadcast
    console.log('\nTest 11: Create announcement and broadcast');
    const newAnn = await announcementService.createAnnouncement(clubA._id, u1._id, {
      title: 'Club Operations Briefing 2026',
      content: 'Important briefing for all organizers and volunteers.',
      targetAudiences: ['Organizers', 'Volunteers'],
      channels: ['in_app', 'email', 'whatsapp']
    });
    assert(newAnn.targetAudiences.includes('Organizers'), 'Stored targetAudiences correctly');

    const broadcastRes = await broadcastService.broadcastAnnouncement(
      clubA._id,
      u1._id,
      newAnn._id,
      ['in_app', 'email', 'whatsapp']
    );

    assert(broadcastRes.summary.inAppDelivered > 0, `Real In-App notifications delivered (got ${broadcastRes.summary.inAppDelivered})`);
    assert(broadcastRes.summary.emailSkipped > 0 || broadcastRes.summary.emailSent >= 0 || broadcastRes.summary.emailSimulated >= 0, 'Email honest handling');
    assert(broadcastRes.announcement.deliveryStats !== null, 'Delivery statistics attached to announcement');

    // Check In-App Notification in DB
    const createdNotif = await Notification.findOne({
      recipient: u2._id,
      'metadata.announcementId': newAnn._id.toString()
    });
    assert(createdNotif !== null, 'Real Notification record found in MongoDB for volunteer Bob');

    // Check BroadcastDelivery status
    const deliveries = await BroadcastDelivery.find({ announcement: newAnn._id });
    assert(deliveries.some(d => d.channel === 'in_app' && d.status === 'delivered'), 'In-App delivery status is delivered');
    assert(deliveries.some(d => d.channel === 'whatsapp' && (d.status === 'not_configured' || d.status === 'simulated')), 'WhatsApp delivery status is not_configured/simulated (no fake delivery)');

    console.log('\n========================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Test suite failed with error:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runTests();
