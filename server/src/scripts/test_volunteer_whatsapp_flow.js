/**
 * End-to-End Verification Script:
 * Volunteer Profile, CRUD Persistence, Contact Truth & WhatsApp Delivery Flow
 */

const mongoose = require('mongoose');
const assert = require('assert');
const config = require('../config/env');
const User = require('../models/User');
const Club = require('../models/Club');
const Volunteer = require('../models/Volunteer');
const volunteerService = require('../services/volunteer.service');
const announcementDeliveryService = require('../services/announcements/announcementDeliveryService');

async function runTests() {
  console.log('=== Starting Volunteer & WhatsApp Flow Tests ===');
  await mongoose.connect(config.mongodbUri || 'mongodb://localhost:27017/clubops_ai');
  console.log('Connected to MongoDB:', mongoose.connection.name);

  // Setup test clubs
  const clubA = await Club.findOneAndUpdate(
    { name: 'Alpha Robotics Club' },
    { name: 'Alpha Robotics Club', code: 'ALPHA_ROBOTICS', description: 'Primary test club' },
    { upsert: true, returnDocument: 'after' }
  );

  const clubB = await Club.findOneAndUpdate(
    { name: 'Beta Astronomy Club' },
    { name: 'Beta Astronomy Club', code: 'BETA_ASTRO', description: 'Isolation test club' },
    { upsert: true, returnDocument: 'after' }
  );

  const testOrganizer = await User.findOneAndUpdate(
    { email: 'organizer_test@alpha.club' },
    {
      name: 'Alpha Organizer',
      email: 'organizer_test@alpha.club',
      password: 'TestPassword123!',
      role: 'organizer',
      club: clubA._id,
      phone: '+919876540001',
      whatsappNumber: '+919876540001',
      isActive: true
    },
    { upsert: true, new: true }
  );

  // Cleanup any old test volunteers
  const testEmails = [
    'priya.shah.test@alpha.club',
    'rahul.patel.test@alpha.club',
    'neha.mehta.test@alpha.club',
    'rohit.sharma.test@beta.club'
  ];
  const oldUsers = await User.find({ email: { $in: testEmails } });
  const oldUserIds = oldUsers.map(u => u._id);
  await Volunteer.deleteMany({ user: { $in: oldUserIds } });
  await User.deleteMany({ email: { $in: testEmails } });

  console.log('\n--- TEST 1: Create a brand-new volunteer with WhatsApp number ---');
  const createdVol1 = await volunteerService.createVolunteer(clubA._id, testOrganizer, {
    name: 'Priya Shah',
    email: 'priya.shah.test@alpha.club',
    phone: '9876543210', // Local 10-digit number
    role: 'volunteer',
    department: 'Logistics',
    availability: 'available',
    skills: ['Coordination', 'Public Speaking'],
    notes: 'Available on weekends'
  });

  assert(createdVol1, 'Volunteer was created');
  assert(createdVol1.user, 'Volunteer references user');
  assert.strictEqual(createdVol1.user.name, 'Priya Shah');
  assert.strictEqual(createdVol1.user.email, 'priya.shah.test@alpha.club');
  assert.strictEqual(createdVol1.user.whatsappNumber, '+919876543210', 'Normalized to E.164 +919876543210');
  assert.strictEqual(createdVol1.department, 'Logistics');
  assert.deepStrictEqual(createdVol1.skills, ['Coordination', 'Public Speaking']);

  // Verify in MongoDB directly
  const dbUser1 = await User.findById(createdVol1.user._id);
  assert.strictEqual(dbUser1.phone, '+919876543210', 'User document stores phone in MongoDB');
  assert.strictEqual(dbUser1.whatsappNumber, '+919876543210', 'User document stores whatsappNumber in MongoDB');
  const dbVol1 = await Volunteer.findById(createdVol1._id);
  assert(dbVol1, 'Volunteer document exists in MongoDB');
  assert.strictEqual(dbVol1.club.toString(), clubA._id.toString());
  console.log('✓ TEST 1 PASSED: Brand-new volunteer created with normalized WhatsApp number and persisted in MongoDB');

  console.log('\n--- TEST 2: Duplicate volunteer creation prevention ---');
  let duplicateThrew = false;
  try {
    await volunteerService.createVolunteer(clubA._id, testOrganizer, {
      name: 'Priya Shah Duplicate',
      email: 'priya.shah.test@alpha.club',
      phone: '+919876543210'
    });
  } catch (err) {
    duplicateThrew = true;
    assert.strictEqual(err.statusCode, 409, 'Returns HTTP 409 conflict');
    assert(err.message.includes('Volunteer already exists'), `Clear error message: ${err.message}`);
  }
  assert(duplicateThrew, 'Duplicate creation was prevented');
  const volCountAfterDup = await Volunteer.countDocuments({ user: dbUser1._id });
  assert.strictEqual(volCountAfterDup, 1, 'No duplicate volunteer record created');
  console.log('✓ TEST 2 PASSED: Duplicate volunteer rejected with HTTP 409');

  console.log('\n--- TEST 3: Update volunteer contact info & volunteer details in MongoDB ---');
  const updatedVol1 = await volunteerService.updateVolunteer(clubA._id, testOrganizer, createdVol1._id, {
    name: 'Priya Shah Updated',
    phone: '+919876500000',
    availability: 'busy',
    skills: ['Coordination', 'Logistics Lead', 'First Aid'],
    notes: 'Updated availability'
  });

  assert.strictEqual(updatedVol1.user.name, 'Priya Shah Updated', 'User name updated');
  assert.strictEqual(updatedVol1.user.phone, '+919876500000', 'User phone updated');
  assert.strictEqual(updatedVol1.user.whatsappNumber, '+919876500000', 'User WhatsApp updated');
  assert.strictEqual(updatedVol1.availability, 'busy', 'Volunteer availability updated');
  assert.deepStrictEqual(updatedVol1.skills, ['Coordination', 'Logistics Lead', 'First Aid']);

  // Fetch directly from DB without caching to verify persistence
  const reloadedUser1 = await User.findById(createdVol1.user._id);
  assert.strictEqual(reloadedUser1.name, 'Priya Shah Updated', 'DB user name persisted');
  assert.strictEqual(reloadedUser1.phone, '+919876500000', 'DB user phone persisted');
  assert.strictEqual(reloadedUser1.whatsappNumber, '+919876500000', 'DB user WhatsApp persisted');

  const reloadedVol1 = await volunteerService.getVolunteerById(clubA._id, createdVol1._id);
  assert.strictEqual(reloadedVol1.user.name, 'Priya Shah Updated', 'getVolunteerById returns updated user');
  assert.strictEqual(reloadedVol1.availability, 'busy');
  console.log('✓ TEST 3 PASSED: Volunteer and User updates persisted directly in MongoDB');

  console.log('\n--- TEST 4: Create volunteer without phone and member without volunteer record ---');
  const createdVol2 = await volunteerService.createVolunteer(clubA._id, testOrganizer, {
    name: 'Neha Mehta',
    email: 'neha.mehta.test@alpha.club',
    phone: '', // No phone
    role: 'volunteer',
    department: 'Marketing',
    availability: 'available'
  });
  assert(createdVol2, 'Created volunteer without phone');
  assert.strictEqual(createdVol2.user.phone, '');
  assert.strictEqual(createdVol2.user.whatsappNumber, '');

  // Create an existing member who is not yet a volunteer
  const memberUser = await User.findOneAndUpdate(
    { email: 'rahul.patel.test@alpha.club' },
    {
      name: 'Rahul Patel',
      email: 'rahul.patel.test@alpha.club',
      password: 'TestPassword123!',
      role: 'member',
      club: clubA._id,
      phone: '+919812345678',
      whatsappNumber: '+919812345678',
      isActive: true
    },
    { upsert: true, new: true }
  );

  // Promote existing member to volunteer
  const createdVol3 = await volunteerService.createVolunteer(clubA._id, testOrganizer, {
    name: 'Rahul Patel',
    email: 'rahul.patel.test@alpha.club',
    department: 'Technical',
    skills: ['React', 'Node.js']
  });
  assert.strictEqual(createdVol3.user._id.toString(), memberUser._id.toString(), 'Reuses existing User document');
  console.log('✓ TEST 4 PASSED: Handled missing phone and promoted existing member to volunteer');

  console.log('\n--- TEST 5: Announcement WhatsApp Recipient Resolution & Preview ---');
  const preview = await announcementDeliveryService.getAudiencePreview(clubA._id, {
    audiences: ['Volunteers']
  });

  assert(preview, 'Preview generated');
  assert(preview.whatsapp, 'WhatsApp preview breakdown included');
  assert.strictEqual(preview.whatsapp.channel, 'whatsapp');
  assert(preview.whatsapp.totalRecipients >= 3, `Expected >= 3 volunteers, got ${preview.whatsapp.totalRecipients}`);
  assert(preview.whatsapp.validRecipients >= 2, `Expected >= 2 with valid WhatsApp number, got ${preview.whatsapp.validRecipients}`);
  assert(preview.whatsapp.missingContact >= 1, `Expected >= 1 missing contact, got ${preview.whatsapp.missingContact}`);

  console.log('WhatsApp Recipient Breakdown:');
  console.log(`- Total: ${preview.whatsapp.totalRecipients}`);
  console.log(`- Valid / Ready: ${preview.whatsapp.validRecipients}`);
  console.log(`- Missing: ${preview.whatsapp.missingContact}`);
  console.log('Recipients List:', preview.whatsapp.recipients.map(r => `${r.name}: ${r.phone || 'No phone'} (${r.status})`));

  const priyaEntry = preview.whatsapp.recipients.find(r => r.name === 'Priya Shah Updated');
  assert(priyaEntry, 'Priya found in recipients');
  assert.strictEqual(priyaEntry.phone, '+919876500000');
  assert.strictEqual(priyaEntry.status, 'ready');

  const nehaEntry = preview.whatsapp.recipients.find(r => r.name === 'Neha Mehta');
  assert(nehaEntry, 'Neha found in recipients');
  assert.strictEqual(nehaEntry.phone, null);
  assert.strictEqual(nehaEntry.status, 'missing_contact');
  console.log('✓ TEST 5 PASSED: Audience WhatsApp recipient resolution and preview verified');

  console.log('\n--- TEST 6: Add phone to Neha profile and verify preview re-query ---');
  await volunteerService.updateVolunteer(clubA._id, testOrganizer, createdVol2._id, {
    phone: '+919811223344'
  });
  const previewAfterAdd = await announcementDeliveryService.getAudiencePreview(clubA._id, {
    audiences: ['Volunteers']
  });
  const nehaAfterAdd = previewAfterAdd.whatsapp.recipients.find(r => r.name === 'Neha Mehta');
  assert.strictEqual(nehaAfterAdd.status, 'ready');
  assert.strictEqual(nehaAfterAdd.phone, '+919811223344');
  console.log('✓ TEST 6 PASSED: Adding WhatsApp number to profile instantly marks recipient as ready in preview');

  console.log('\n--- TEST 7: Club Multi-Tenant Isolation Check ---');
  await User.findOneAndUpdate(
    { email: 'rohit.sharma.test@beta.club' },
    {
      name: 'Rohit Sharma',
      email: 'rohit.sharma.test@beta.club',
      password: 'TestPassword123!',
      role: 'volunteer',
      club: clubB._id,
      phone: '+919899887766',
      whatsappNumber: '+919899887766',
      isActive: true
    },
    { upsert: true, new: true }
  );

  const previewClubA = await announcementDeliveryService.getAudiencePreview(clubA._id, {
    audiences: ['Volunteers']
  });
  const rohitInClubA = previewClubA.whatsapp.recipients.find(r => r.name === 'Rohit Sharma');
  assert.strictEqual(rohitInClubA, undefined, 'Club B member is NOT included in Club A preview');
  console.log('✓ TEST 7 PASSED: Club isolation enforced');

  console.log('\n=============================================');
  console.log('ALL VOLUNTEER & WHATSAPP FLOW TESTS PASSED!');
  console.log('=============================================');

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
