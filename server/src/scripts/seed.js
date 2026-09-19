/**
 * ClubOps AI — Deterministic Demo Database Seeder
 * Populates MongoDB with realistic hackathon demo data matching PS-3 requirements.
 */

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../db/connection');
const config = require('../config/env');

const Club = require('../models/Club');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const Document = require('../models/Document');
const Risk = require('../models/Risk');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const BroadcastDelivery = require('../models/BroadcastDelivery');

const { chunkDocument } = require('../ai/rag/chunker');
const { generateEmbedding, generateDeterministicVector } = require('../ai/rag/embeddings');

const {
  CLUBS,
  USERS,
  EVENTS,
  TASKS,
  MEETINGS,
  DOCUMENTS,
  RISKS,
  ANNOUNCEMENTS
} = require('../utils/seederData');

async function runSeed() {
  // Safety check: Prevent running seed in production
  if (process.env.NODE_ENV === 'production' && !process.env.FORCE_SEED) {
    console.error('❌ SEED ABORTED: Cannot run demo seeder in production environment.');
    process.exit(1);
  }

  console.log('🚀 Starting ClubOps AI Demo Database Seeder...');
  await connectDB();

  const summary = {
    clubs: 0,
    users: 0,
    volunteers: 0,
    events: 0,
    tasks: 0,
    meetings: 0,
    documents: 0,
    documentChunks: 0,
    risks: 0,
    announcements: 0,
    notifications: 0,
    broadcastDeliveries: 0
  };

  try {
    const clubMap = new Map(); // clubCode -> Club doc
    const userMap = new Map(); // email -> User doc
    const eventMap = new Map(); // eventTitle -> Event doc

    // 1. First Pass: Create or Find Lead Organizer Users
    const leadConfigs = [
      { email: 'lead@club.edu', name: 'Alex Vance (Lead Organizer)', role: 'organizer', clubCode: 'TECH2026' },
      { email: 'robo.lead@club.edu', name: 'Sarah Connor', role: 'organizer', clubCode: 'ROBO2026' }
    ];

    for (const lead of leadConfigs) {
      let user = await User.findOne({ email: lead.email });
      if (!user) {
        user = new User({
          email: lead.email,
          name: lead.name,
          password: 'Password123!',
          role: lead.role,
          department: 'Executive'
        });
        await user.save();
      } else {
        user.name = lead.name;
        user.role = lead.role;
        user.password = 'Password123!';
        await user.save();
      }
      userMap.set(lead.email, user);
      summary.users++;
    }

    // 2. Seed Clubs using Lead Organizers
    for (const clubData of CLUBS) {
      const leadEmail = clubData.code === 'TECH2026' ? 'lead@club.edu' : 'robo.lead@club.edu';
      const leadUser = userMap.get(leadEmail);

      let club = await Club.findOne({ code: clubData.code });
      if (!club) {
        club = await Club.create({
          name: clubData.name,
          code: clubData.code,
          description: clubData.description,
          leadOrganizer: leadUser._id
        });
      } else {
        club.name = clubData.name;
        club.description = clubData.description;
        club.leadOrganizer = leadUser._id;
        await club.save();
      }

      // Link club to lead organizer
      leadUser.club = club._id;
      await leadUser.save();

      clubMap.set(clubData.code, club);
      summary.clubs++;
    }

    // 3. Seed Remaining Users & Volunteer Profiles
    for (const userData of USERS) {
      if (userMap.has(userData.email)) continue; // Already created lead

      const club = clubMap.get(userData.clubCode);
      if (!club) continue;

      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User({
          email: userData.email,
          name: userData.name,
          password: 'Password123!',
          role: userData.role,
          department: userData.department,
          club: club._id
        });
        await user.save();
      } else {
        user.name = userData.name;
        user.role = userData.role;
        user.department = userData.department;
        user.club = club._id;
        user.password = 'Password123!';
        await user.save();
      }

      userMap.set(userData.email, user);
      summary.users++;

      // Seed Volunteer document if role is volunteer
      if (userData.volunteerInfo) {
        let vol = await Volunteer.findOne({ user: user._id, club: club._id });
        if (!vol) {
          vol = await Volunteer.create({
            user: user._id,
            club: club._id,
            skills: userData.volunteerInfo.skills,
            department: userData.department,
            availability: userData.volunteerInfo.availability,
            rating: userData.volunteerInfo.rating,
            notes: userData.volunteerInfo.notes
          });
        } else {
          vol.skills = userData.volunteerInfo.skills;
          vol.department = userData.department;
          vol.availability = userData.volunteerInfo.availability;
          vol.rating = userData.volunteerInfo.rating;
          vol.notes = userData.volunteerInfo.notes;
          await vol.save();
        }
        summary.volunteers++;
      }
    }

    // 4. Seed Events
    for (const eventData of EVENTS) {
      const club = clubMap.get(eventData.clubCode);
      const leadUser = userMap.get(eventData.leadEmail);
      if (!club || !leadUser) continue;

      let event = await Event.findOne({ title: eventData.title, club: club._id });
      if (!event) {
        event = await Event.create({
          title: eventData.title,
          description: eventData.description,
          club: club._id,
          leadOrganizer: leadUser._id,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          location: eventData.location,
          venue: eventData.venue,
          status: eventData.status,
          category: eventData.category,
          budget: eventData.budget,
          createdBy: leadUser._id
        });
      } else {
        event.description = eventData.description;
        event.leadOrganizer = leadUser._id;
        event.startDate = eventData.startDate;
        event.endDate = eventData.endDate;
        event.location = eventData.location;
        event.venue = eventData.venue;
        event.status = eventData.status;
        event.category = eventData.category;
        event.budget = eventData.budget;
        await event.save();
      }

      eventMap.set(eventData.title, event);
      summary.events++;
    }

    const leadUserA = userMap.get('lead@club.edu');
    const clubA = clubMap.get('TECH2026');
    const primaryEvent = eventMap.get('Google Cloud Hackathon 2026');

    // 5. Seed Tasks
    for (const taskData of TASKS) {
      const club = clubMap.get(taskData.clubCode);
      const event = eventMap.get(taskData.eventTitle);
      if (!club || !event) continue;

      const assignee = taskData.assigneeEmail ? userMap.get(taskData.assigneeEmail) : null;
      let vol = null;
      if (assignee) {
        vol = await Volunteer.findOne({ user: assignee._id, club: club._id });
      }

      let task = await Task.findOne({ title: taskData.title, event: event._id });
      if (!task) {
        task = await Task.create({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignedTo: assignee ? assignee._id : null,
          volunteer: vol ? vol._id : null,
          event: event._id,
          club: club._id,
          dueDate: taskData.dueDate,
          createdBy: leadUserA ? leadUserA._id : (assignee ? assignee._id : userMap.get('robo.lead@club.edu')._id)
        });
      } else {
        task.description = taskData.description;
        task.status = taskData.status;
        task.priority = taskData.priority;
        task.assignedTo = assignee ? assignee._id : null;
        task.volunteer = vol ? vol._id : null;
        task.dueDate = taskData.dueDate;
        await task.save();
      }

      summary.tasks++;
    }

    // 6. Seed Meetings & Transcript
    for (const meetingData of MEETINGS) {
      const club = clubMap.get(meetingData.clubCode);
      const event = eventMap.get(meetingData.eventTitle);
      if (!club || !event) continue;

      const participantIds = [
        userMap.get('lead@club.edu')?._id,
        userMap.get('priya@club.edu')?._id,
        userMap.get('rahul@club.edu')?._id,
        userMap.get('alex@club.edu')?._id
      ].filter(Boolean);

      let meeting = await Meeting.findOne({ title: meetingData.title, club: club._id });
      if (!meeting) {
        meeting = await Meeting.create({
          title: meetingData.title,
          description: meetingData.description,
          event: event._id,
          club: club._id,
          scheduledAt: meetingData.scheduledAt,
          durationMinutes: meetingData.durationMinutes,
          location: meetingData.location,
          participants: participantIds,
          agenda: meetingData.agenda,
          notes: meetingData.notes,
          transcript: meetingData.transcript,
          actionItemsExtracted: meetingData.actionItemsExtracted,
          aiProcessed: meetingData.aiProcessed,
          extractedItems: meetingData.extractedItems,
          createdBy: leadUserA._id
        });
      } else {
        meeting.description = meetingData.description;
        meeting.event = event._id;
        meeting.participants = participantIds;
        meeting.agenda = meetingData.agenda;
        meeting.notes = meetingData.notes;
        meeting.transcript = meetingData.transcript;
        meeting.extractedItems = meetingData.extractedItems;
        await meeting.save();
      }

      summary.meetings++;
    }

    // 7. Seed RAG Knowledge Base Documents with Real 768-dim Embeddings
    for (const docData of DOCUMENTS) {
      const club = clubMap.get(docData.clubCode);
      const uploader = docData.clubCode === 'TECH2026' ? leadUserA : userMap.get('robo.lead@club.edu');
      if (!club || !uploader) continue;

      // Create chunks
      const rawChunks = chunkDocument(docData.content, [], { chunkSize: 700, chunkOverlap: 100 });
      const processedChunks = [];

      for (const rc of rawChunks) {
        let embeddingVector;
        try {
          embeddingVector = await generateEmbedding(rc.text);
        } catch (e) {
          embeddingVector = generateDeterministicVector(rc.text, 768);
        }

        processedChunks.push({
          chunkIndex: rc.chunkIndex,
          text: rc.text,
          embedding: embeddingVector,
          pageNumber: 1,
          tokenCount: rc.tokenCount,
          startOffset: rc.startOffset,
          endOffset: rc.endOffset
        });
        summary.documentChunks++;
      }

      let doc = await Document.findOne({ title: docData.title, club: club._id });
      if (!doc) {
        doc = await Document.create({
          title: docData.title,
          description: docData.description,
          fileType: docData.fileType,
          category: docData.category,
          club: club._id,
          event: docData.clubCode === 'TECH2026' ? primaryEvent?._id : null,
          uploadedBy: uploader._id,
          isKnowledgeBase: true,
          chunks: processedChunks,
          chunkCount: processedChunks.length,
          ingestionStatus: 'processed',
          sourceFileName: docData.sourceFileName,
          extractedCharacterCount: docData.content.length,
          embeddingModel: config.gemini?.embeddingModel || 'text-embedding-004',
          processedAt: new Date()
        });
      } else {
        doc.description = docData.description;
        doc.chunks = processedChunks;
        doc.chunkCount = processedChunks.length;
        doc.ingestionStatus = 'processed';
        doc.processedAt = new Date();
        await doc.save();
      }

      summary.documents++;
    }

    // 8. Seed Operational Risks
    for (const riskData of RISKS) {
      const club = clubMap.get(riskData.clubCode);
      const event = eventMap.get(riskData.eventTitle);
      if (!club || !event) continue;

      let risk = await Risk.findOne({ title: riskData.title, event: event._id });
      if (!risk) {
        risk = await Risk.create({
          title: riskData.title,
          description: riskData.description,
          severity: riskData.severity,
          probability: riskData.probability,
          status: riskData.status,
          mitigationPlan: riskData.mitigationPlan,
          event: event._id,
          club: club._id,
          owner: leadUserA ? leadUserA._id : null,
          aiDetected: riskData.aiDetected,
          aiReasoning: riskData.aiReasoning,
          createdBy: leadUserA ? leadUserA._id : null
        });
      } else {
        risk.description = riskData.description;
        risk.severity = riskData.severity;
        risk.probability = riskData.probability;
        risk.status = riskData.status;
        risk.mitigationPlan = riskData.mitigationPlan;
        risk.aiDetected = riskData.aiDetected;
        risk.aiReasoning = riskData.aiReasoning;
        await risk.save();
      }

      summary.risks++;
    }

    // 9. Seed Announcements & Simulated Broadcast Receipts
    for (const annData of ANNOUNCEMENTS) {
      const club = clubMap.get(annData.clubCode);
      const event = eventMap.get(annData.eventTitle);
      const author = annData.clubCode === 'TECH2026' ? leadUserA : userMap.get('robo.lead@club.edu');
      if (!club || !author) continue;

      let ann = await Announcement.findOne({ title: annData.title, club: club._id });
      if (!ann) {
        ann = await Announcement.create({
          title: annData.title,
          content: annData.content,
          targetAudience: annData.targetAudience,
          priority: annData.priority,
          status: annData.status,
          club: club._id,
          event: event ? event._id : null,
          createdBy: author._id
        });
      } else {
        ann.content = annData.content;
        ann.targetAudience = annData.targetAudience;
        ann.priority = annData.priority;
        ann.status = annData.status;
        ann.createdBy = author._id;
        await ann.save();
      }

      summary.announcements++;

      // Create simulated broadcast deliveries for published announcements in Club A
      if (annData.clubCode === 'TECH2026' && annData.status === 'published') {
        const recipients = [userMap.get('rahul@club.edu'), userMap.get('priya@club.edu'), userMap.get('alex@club.edu')].filter(Boolean);

        for (const recipient of recipients) {
          for (const channel of ['in_app', 'email', 'whatsapp']) {
            await BroadcastDelivery.findOneAndUpdate(
              { announcement: ann._id, recipient: recipient._id, channel },
              {
                announcement: ann._id,
                recipient: recipient._id,
                club: club._id,
                channel,
                status: 'delivered',
                deliveredAt: new Date(),
                simulated: channel !== 'in_app',
                metadata: {
                  providerMessageId: `sim_${channel}_${recipient._id.toString().slice(-4)}_${Date.now()}`
                }
              },
              { upsert: true, new: true }
            );
            summary.broadcastDeliveries++;
          }
        }
      }
    }

    // 10. Seed In-App Notifications
    if (leadUserA && clubA && primaryEvent) {
      const notificationPresets = [
        {
          recipient: userMap.get('rahul@club.edu')?._id,
          title: 'Task Assigned: Registration Desk Setup',
          message: 'You have been assigned to lead the registration desk and check-in distribution.',
          type: 'task_assigned',
          priority: 'high'
        },
        {
          recipient: userMap.get('priya@club.edu')?._id,
          title: 'Action Item Approved: Auditorium Booking',
          message: 'Your kickoff meeting action item has been confirmed as an operational task.',
          type: 'meeting_action',
          priority: 'normal'
        },
        {
          recipient: leadUserA._id,
          title: 'Operational Risk Alert: AV Delivery Delay',
          message: 'Audio/Visual stage equipment testing task requires urgent verification.',
          type: 'risk_critical',
          priority: 'urgent'
        },
        {
          recipient: userMap.get('alex@club.edu')?._id,
          title: 'Broadcast: Volunteer Briefing Tomorrow',
          message: 'Mandatory Google Cloud Hackathon 2026 operational briefing scheduled for 6 PM.',
          type: 'announcement_broadcast',
          priority: 'high'
        }
      ];

      for (const np of notificationPresets) {
        if (!np.recipient) continue;
        await Notification.findOneAndUpdate(
          { recipient: np.recipient, title: np.title },
          {
            recipient: np.recipient,
            club: clubA._id,
            event: primaryEvent._id,
            type: np.type,
            title: np.title,
            message: np.message,
            priority: np.priority,
            read: false
          },
          { upsert: true, new: true }
        );
        summary.notifications++;
      }
    }

    console.log('\n========================================');
    console.log('   ClubOps AI Demo Seeder Summary       ');
    console.log('========================================');
    console.log(`Clubs:                  ${summary.clubs}`);
    console.log(`Users:                  ${summary.users}`);
    console.log(`Volunteers:             ${summary.volunteers}`);
    console.log(`Events:                 ${summary.events}`);
    console.log(`Tasks:                  ${summary.tasks}`);
    console.log(`Meetings:               ${summary.meetings}`);
    console.log(`Knowledge Base Docs:    ${summary.documents} (${summary.documentChunks} chunks indexed)`);
    console.log(`Operational Risks:      ${summary.risks}`);
    console.log(`Announcements:          ${summary.announcements}`);
    console.log(`Simulated Deliveries:   ${summary.broadcastDeliveries}`);
    console.log(`In-App Notifications:   ${summary.notifications}`);
    console.log('========================================');
    console.log('✅ Demo database seed completed successfully.\n');

  } catch (err) {
    console.error('❌ Seeder encountered an error:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log('🔌 MongoDB connection closed.');
  }
}

if (require.main === module) {
  runSeed().then(() => {
    process.exit(process.exitCode || 0);
  });
}

module.exports = { runSeed };
