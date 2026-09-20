/**
 * Automated Test Suite for Meeting Creation & AI Task Extraction Flows
 */

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../db/connection');
const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const meetingService = require('../services/meeting.service');
const taskService = require('../services/task.service');
const aiService = require('../ai/services/ai.service');

async function runTests() {
  console.log('🧪 Starting Meeting Creation & Task Extraction Verification Test...\n');
  await connectDB();

  let passed = 0;
  let total = 0;

  function assert(condition, msg) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  try {
    // 1. Setup test club & admin
    let club = await Club.findOne({ code: 'MTG-TASK-TEST' });
    if (!club) {
      const admin = await User.create({
        name: 'Mtg Admin',
        email: `admin.mtg.${Date.now()}@test.org`,
        password: 'password123',
        role: 'admin'
      });
      club = await Club.create({
        name: 'Meeting & Task Test Club',
        code: 'MTG-TASK-TEST',
        leadOrganizer: admin._id
      });
      admin.club = club._id;
      await admin.save();
    }

    const adminUser = await User.findOne({ club: club._id, role: 'admin' });

    // Seed a participant
    const participant = await User.create({
      name: 'Participant One',
      email: `part1.${Date.now()}@test.org`,
      password: 'password123',
      role: 'member',
      club: club._id
    });

    // Seed an event
    const event = await Event.create({
      title: 'Annual TechFest 2026',
      description: 'Major technology festival',
      club: club._id,
      leadOrganizer: adminUser._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      location: 'Main Auditorium',
      createdBy: adminUser._id
    });

    console.log('--- TEST 1: Create Meeting with Standalone / None Event ---');
    const meetingStandalone = await meetingService.createMeeting(club._id, adminUser._id, {
      title: 'Core Team Sync',
      event: 'none', // Frontend sends 'none' or ''
      type: 'Team Meeting',
      date: '2026-09-21',
      startTime: '11:41',
      endTime: '11:47',
      location: 'Conference Room 3',
      participants: [participant.email, adminUser._id.toString()],
      agenda: '1. Review roadmap\n2. Delegate work breakdown',
      notes: 'Team agreed to finalize registration forms by Friday.'
    });

    assert(meetingStandalone && meetingStandalone.title === 'Core Team Sync', 'Standalone meeting created successfully');
    assert(meetingStandalone.event === null, 'Event is correctly set to null for standalone meeting');
    assert(meetingStandalone.durationMinutes === 6, `Duration accurately computed (6 mins, got ${meetingStandalone.durationMinutes})`);
    assert(meetingStandalone.participants.length === 2, `Participants resolved by email & ObjectId (${meetingStandalone.participants.length})`);
    assert(meetingStandalone.type === 'Team Meeting', 'Meeting type persisted correctly');

    console.log('\n--- TEST 2: Create Meeting with Linked Event ---');
    const meetingEventLinked = await meetingService.createMeeting(club._id, adminUser._id, {
      title: 'TechFest Volunteer Briefing',
      event: event._id.toString(),
      type: 'Planning',
      scheduledAt: new Date(),
      durationMinutes: 45,
      location: 'Auditorium Hall B',
      agenda: ['Logistics setup', 'Guest coordination'],
      notes: 'Alice to coordinate badges, Bob to verify mic audio.'
    });

    assert(meetingEventLinked && meetingEventLinked.event._id.toString() === event._id.toString(), 'Meeting linked to real Event successfully');

    console.log('\n--- TEST 3: Create Task with & without Event ---');
    const standaloneTask = await taskService.createTask(club._id, adminUser._id, {
      title: 'Design Marketing Poster',
      description: 'Prepare visual assets for club promotion',
      priority: 'high',
      status: 'todo',
      event: null
    });
    assert(standaloneTask && standaloneTask.title === 'Design Marketing Poster', 'Standalone task created with null event');

    const eventTask = await taskService.createTask(club._id, adminUser._id, {
      title: 'Setup Audio System',
      description: 'Connect main speakers in Auditorium',
      priority: 'urgent',
      event: event._id.toString(),
      assignedTo: participant._id.toString()
    });
    assert(eventTask && eventTask.event.toString() === event._id.toString(), 'Event-linked task created successfully');

    console.log('\n--- TEST 4: AI Action Item Extraction from Text ---');
    const sampleNotes = `
    Meeting Discussion Notes:
    - Alice needs to prepare the stage backdrop before Thursday (urgent priority).
    - Bob is responsible for ordering pizzas and refreshments by tomorrow (medium priority).
    - Team agreed to publish event registration link on social channels (high priority).
    `;

    const extractionResult = await aiService.extractActionsFromText(club._id, {
      text: sampleNotes,
      eventId: event._id.toString()
    });

    assert(extractionResult && extractionResult.actionItems, 'extractActionsFromText returns actionItems structure');
    console.log(`  Extracted ${extractionResult.actionItems.length} action items from notes.`);
    assert(extractionResult.actionItems.length > 0, 'Extracted at least one actionable item from sample notes');

    // Create tasks from extracted items
    for (const item of extractionResult.actionItems.slice(0, 2)) {
      const created = await taskService.createTask(club._id, adminUser._id, {
        title: item.title,
        description: item.description || 'Extracted via AI test',
        priority: item.priority ? item.priority.toLowerCase() : 'medium',
        event: event._id.toString()
      });
      assert(created && created._id, `Created Task in MongoDB: "${created.title}"`);
    }

    console.log(`\n🎉 ALL ${passed}/${total} TESTS PASSED!`);
  } catch (err) {
    console.error('\n❌ Test failure:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runTests };
