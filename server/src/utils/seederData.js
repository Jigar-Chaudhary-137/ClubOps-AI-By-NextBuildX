/**
 * Realistic Deterministic Seed Dataset for ClubOps AI
 * Aligned with Hackathon PS-3 Requirements and Demo Flow.
 */

// Helper to generate dynamic future dates relative to execution time
const getDynamicDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const CLUBS = [
  {
    name: 'NextBuild Tech Club',
    code: 'TECH2026',
    description: 'Premier student tech and open-source innovation club organizing collegiate hackathons, developer workshops, and AI bootcamps.'
  },
  {
    name: 'Robotics Society',
    code: 'ROBO2026',
    description: 'Autonomous robotics, IoT, and hardware engineering club focused on competitive drone racing and robotics challenges.'
  }
];

const USERS = [
  // Club A (NextBuild Tech Club)
  {
    email: 'lead@club.edu',
    name: 'Alex Vance (Lead Organizer)',
    role: 'organizer',
    department: 'Executive',
    clubCode: 'TECH2026'
  },
  {
    email: 'rahul@club.edu',
    name: 'Rahul Sharma',
    role: 'volunteer',
    department: 'Engineering',
    clubCode: 'TECH2026',
    volunteerInfo: {
      skills: ['React', 'Cloud', 'Python', 'FullStack'],
      availability: 'available',
      rating: 5,
      notes: 'Experienced frontend lead and cloud workshop mentor.'
    }
  },
  {
    email: 'priya@club.edu',
    name: 'Priya Patel',
    role: 'volunteer',
    department: 'Design & Sponsorship',
    clubCode: 'TECH2026',
    volunteerInfo: {
      skills: ['Figma', 'Sponsorship', 'Stage Setup', 'Branding'],
      availability: 'assigned',
      rating: 5,
      notes: 'Lead for sponsor relations, branding kits, and venue aesthetics.'
    }
  },
  {
    email: 'alex@club.edu',
    name: 'Alex Chen',
    role: 'volunteer',
    department: 'Operations',
    clubCode: 'TECH2026',
    volunteerInfo: {
      skills: ['Logistics', 'Audio/Visual', 'Crowd Management'],
      availability: 'busy',
      rating: 4,
      notes: 'Auditorium logistics coordinator and AV equipment specialist.'
    }
  },
  {
    email: 'member@club.edu',
    name: 'Jordan Miller',
    role: 'member',
    department: 'General',
    clubCode: 'TECH2026'
  },
  // Club B (Robotics Society - Isolation Club)
  {
    email: 'robo.lead@club.edu',
    name: 'Sarah Connor',
    role: 'organizer',
    department: 'Executive',
    clubCode: 'ROBO2026'
  }
];

const EVENTS = [
  // Primary Club A Event
  {
    title: 'Google Cloud Hackathon 2026',
    description: 'Flagship 36-hour annual collegiate hackathon bringing together 250+ student builders for AI, Cloud Architecture, and Web3 tracks.',
    clubCode: 'TECH2026',
    startDate: getDynamicDate(14),
    endDate: getDynamicDate(16),
    location: 'Campus Main Auditorium & Innovation Lab',
    venue: {
      name: 'Campus Main Auditorium',
      capacity: 300,
      booked: true
    },
    status: 'planning',
    category: 'Hackathon',
    budget: {
      allocated: 5000,
      spent: 1200,
      currency: 'USD'
    },
    leadEmail: 'lead@club.edu'
  },
  // Isolation Club B Event
  {
    title: 'Autonomous Drone Challenge 2026',
    description: 'Robotics obstacle navigation and autonomous flight competition for university robotics teams.',
    clubCode: 'ROBO2026',
    startDate: getDynamicDate(30),
    endDate: getDynamicDate(31),
    location: 'Engineering Quad Arena',
    venue: {
      name: 'Outdoor Flight Arena',
      capacity: 150,
      booked: true
    },
    status: 'planning',
    category: 'Competition',
    budget: {
      allocated: 3500,
      spent: 500,
      currency: 'USD'
    },
    leadEmail: 'robo.lead@club.edu'
  }
];

const TASKS = [
  {
    title: 'Finalize auditorium booking and AV permits',
    description: 'Obtain university administrative clearance and safety sign-off for overnight campus access.',
    status: 'completed',
    priority: 'urgent',
    assigneeEmail: 'priya@club.edu',
    dueDate: getDynamicDate(5),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Set up registration desk and welcome kit distribution',
    description: 'Prepare QR check-in scanners, badge lanyards, and swag packages for 250 participants.',
    status: 'in_progress',
    priority: 'high',
    assigneeEmail: 'rahul@club.edu',
    dueDate: getDynamicDate(12),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Test stage audio equipment and projector feeds',
    description: 'Perform frequency test on wireless lapel mics and calibrate high-resolution projection screens.',
    status: 'todo',
    priority: 'urgent',
    assigneeEmail: 'alex@club.edu',
    dueDate: getDynamicDate(13),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Prepare sponsor pitch deck and invoice package',
    description: 'Dispatch tier deliverables to Gold & Silver tech sponsors and verify tax receipt paperwork.',
    status: 'review',
    priority: 'high',
    assigneeEmail: 'priya@club.edu',
    dueDate: getDynamicDate(7),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Publish participant guidelines and hackathon rulebook',
    description: 'Draft API rules, judging rubrics, and code-of-conduct document for participating teams.',
    status: 'completed',
    priority: 'medium',
    assigneeEmail: 'rahul@club.edu',
    dueDate: getDynamicDate(4),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Coordinate mentor schedule for cloud track workshops',
    description: 'Confirm 6 industry mentors for hands-on Gemini API and Google Cloud architecture office hours.',
    status: 'in_progress',
    priority: 'high',
    assigneeEmail: 'rahul@club.edu',
    dueDate: getDynamicDate(10),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Prepare emergency contacts & medical room setup',
    description: 'Coordinate with campus health center for first-aid station and emergency on-call contact.',
    status: 'todo',
    priority: 'medium',
    assigneeEmail: 'alex@club.edu',
    dueDate: getDynamicDate(13),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Finalize volunteer shift roster and catering count',
    description: 'Assign volunteer slots across morning, afternoon, and midnight shifts for refreshments.',
    status: 'todo',
    priority: 'low',
    assigneeEmail: null,
    dueDate: getDynamicDate(11),
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  // Isolation Club B Task
  {
    title: 'Calibrate obstacle sensors for drone race track',
    description: 'Configure LIDAR gates and safety netting for autonomous drone flight arena.',
    status: 'todo',
    priority: 'high',
    assigneeEmail: 'robo.lead@club.edu',
    dueDate: getDynamicDate(20),
    clubCode: 'ROBO2026',
    eventTitle: 'Autonomous Drone Challenge 2026'
  }
];

const MEETINGS = [
  {
    title: 'Core Team Kickoff Meeting',
    description: 'Initial strategic alignment meeting for Google Cloud Hackathon 2026 milestones, logistics, and duties.',
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026',
    scheduledAt: getDynamicDate(-3),
    durationMinutes: 60,
    location: 'Innovation Lab Conf Room A',
    agenda: [
      'Event venue and overnight permits clearance',
      'Sponsorship tier updates and invoicing',
      'Audio/Visual equipment & stage testing',
      'Volunteer lead assignments and timelines'
    ],
    notes: 'Key decisions made: Auditorium confirmed. Priya handling sponsor decks. Rahul coordinating cloud mentors. Alex managing AV setup.',
    transcript: `Lead Organizer (Alex Vance): Welcome team to our Google Cloud Hackathon 2026 kickoff meeting. Let's align on core deliverables.
Priya Patel: The campus administration has approved our preliminary venue request. I will finalize the auditorium booking and AV permits by Friday to secure overnight access.
Lead Organizer (Alex Vance): Great. Priya, please also prepare the sponsor presentation and invoice packages for our Gold and Silver sponsors.
Priya Patel: I am already drafting the packages and will send them for review by Tuesday.
Rahul Sharma: I have drafted the participant guidelines and code of conduct. Next, I will coordinate the mentor schedule for the Gemini AI and Cloud workshops.
Lead Organizer (Alex Vance): Excellent. Alex, what is the status of our stage setup?
Alex Chen: We need to test the stage audio equipment and projector feeds. I will run sound checks and lapel mic calibration with the AV team two days before the hackathon kickoff.
Lead Organizer (Alex Vance): Perfect. Let's make sure all action items are tracked in ClubOps AI.`,
    extractedItems: [
      {
        title: 'Finalize auditorium booking and AV permits',
        assignedTo: 'Priya Patel',
        deadline: 'Friday',
        priority: 'urgent',
        applied: true
      },
      {
        title: 'Prepare sponsor pitch deck and invoice package',
        assignedTo: 'Priya Patel',
        deadline: 'Tuesday',
        priority: 'high',
        applied: true
      },
      {
        title: 'Coordinate mentor schedule for cloud track workshops',
        assignedTo: 'Rahul Sharma',
        deadline: 'Next week',
        priority: 'high',
        applied: true
      },
      {
        title: 'Test stage audio equipment and projector feeds',
        assignedTo: 'Alex Chen',
        deadline: '2 days before event',
        priority: 'urgent',
        applied: true
      }
    ],
    actionItemsExtracted: true,
    aiProcessed: true
  }
];

const DOCUMENTS = [
  {
    title: 'Club Sponsorship Guidelines',
    description: 'Official corporate sponsorship tiers, deliverable checklists, and partnership terms for collegiate tech events.',
    category: 'sponsorship',
    clubCode: 'TECH2026',
    isKnowledgeBase: true,
    content: `# NextBuild Tech Club — Sponsorship Guidelines & Tier Structure

## Sponsorship Tiers Overview
The club offers three standardized sponsorship packages for the annual Google Cloud Hackathon 2026:

### 1. Title / Diamond Sponsor ($2,500)
- Exclusive naming rights (e.g., "Google Cloud Hackathon presented by [Sponsor]").
- 45-minute keynote workshop slot during prime time.
- Dedicated double-width recruitment booth in the main exhibition hall.
- Access to opt-in participant resumes and GitHub portfolios.
- Guaranteed 5 judging seats during final team evaluations.

### 2. Gold Sponsor ($1,500)
- Prominent logo placement on website, lanyards, stage backdrops, and promotional banners.
- 20-minute technical breakout workshop session.
- Standard recruitment booth (6ft table with power and high-speed Wi-Fi).
- Distribution of branded swag kits in participant welcome bags.
- 2 judging seats in category tracks.

### 3. Silver Sponsor ($750)
- Logo placement on the official website and shared digital sponsor banner.
- Branded flyer / digital sticker distribution.
- Recognition during opening and closing ceremonies.

## Invoicing and Payment Terms
- All sponsorship agreements require a signed memorandum of understanding (MoU).
- Invoices are payable net 15 days from dispatch.
- Payment must be received in the official club university escrow account prior to event commencement.
- Direct vendor reimbursements require pre-authorization from the Lead Organizer.`,
    fileType: 'pdf',
    sourceFileName: 'Sponsorship_Guidelines_2026.pdf'
  },
  {
    title: 'Campus Venue Booking & Safety Rules',
    description: 'Facility access rules, fire exit protocols, noise curfews, and equipment safety standards for campus spaces.',
    category: 'rules',
    clubCode: 'TECH2026',
    isKnowledgeBase: true,
    content: `# Campus Venue Booking, Facility Use & Safety Rules

## 1. Auditorium & Facility Access
- Main Auditorium capacity is strictly capped at 300 occupants.
- Overnight event access requires pre-approved security passes issued by Campus Safety.
- All participants and organizers must display issued holographic lanyards at all times.
- Outside catering must adhere to campus food safety protocols; electrical hotplates are strictly prohibited in the main auditorium seating area.

## 2. Fire and Emergency Safety Protocols
- Aisles, emergency exit doors, and fire extinguisher stations must remain unobstructed by cables, tables, or banners.
- Power distribution boxes must be elevated off the floor using certified rubber cable ramps.
- A designated First Aid Officer and emergency evacuation warden must remain on duty for all multi-hour gatherings.

## 3. Noise & Equipment Regulations
- Sound levels in the auditorium must not exceed 85 decibels.
- Stage lighting trusses and heavy speakers must be anchored by certified university technicians.
- Quiet hours in surrounding campus corridors begin at 10:00 PM. High-volume audio checks are not permitted between 10:00 PM and 7:00 AM.`,
    fileType: 'pdf',
    sourceFileName: 'Campus_Venue_Safety_Rules.pdf'
  },
  {
    title: 'Reimbursement Policy',
    description: 'Financial guidelines, expense limits, approval hierarchies, and allowable receipts for club organizers and volunteers.',
    category: 'guidelines',
    clubCode: 'TECH2026',
    isKnowledgeBase: true,
    content: `# NextBuild Tech Club — Financial Reimbursement Policy

## 1. Expenditure Authorization Thresholds
- **Below $100**: Operational leads may execute necessary supplies purchases (stationery, cords, first aid) with self-authorization.
- **$100 to $500**: Requires written approval from the Lead Organizer before incurring expense.
- **Above $500**: Requires dual sign-off from the Lead Organizer and the Faculty Club Advisor.

## 2. Eligible Expenses
- Event logistical supplies, badges, directional signage, and stage consumables.
- Refreshments and catering for volunteer staff during scheduled shifts.
- Hardware kits, breakout boards, and demo components for official workshops.
- Certified emergency transportation expenses related to event operations.

## 3. Ineligible Expenses
- Personal dining expenses outside scheduled shifts.
- Alcoholic beverages or unapproved luxury items.
- Parking violations, traffic fines, or unverified cash payments.

## 4. Claim Submission Workflow
- All reimbursement claims must be submitted within 7 business days following the event.
- Itemized tax receipts showing date, merchant, and line items must be uploaded to ClubOps AI.
- Approved claims are reimbursed via direct bank deposit within 5 to 10 working days.`,
    fileType: 'pdf',
    sourceFileName: 'Reimbursement_Policy_2026.pdf'
  },
  // Isolation Club B Document
  {
    title: 'Robotics Lab Safety Protocol',
    description: 'Hardware lab safety rules and drone testing procedures for Robotics Society.',
    category: 'rules',
    clubCode: 'ROBO2026',
    isKnowledgeBase: true,
    content: `# Robotics Society — Drone Lab Protocol
- All drone battery charging must use fireproof LiPo bags.
- Propeller guards are mandatory for all indoor test flights.
- Emergency motor cutoff switches must be verified prior to propeller spin-up.`,
    fileType: 'pdf',
    sourceFileName: 'Robo_Lab_Safety.pdf'
  }
];

const RISKS = [
  {
    title: 'Audio/Visual Vendor Delay',
    description: 'External stage audio equipment delivery may delay opening ceremony sound checks.',
    severity: 'high',
    probability: 'medium',
    status: 'identified',
    mitigationPlan: 'Contact campus backup AV department and schedule preliminary testing 48 hours prior to the event.',
    aiDetected: true,
    aiReasoning: 'Stage testing task is currently marked pending with only 13 days remaining until the hackathon opening ceremony.',
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Sponsorship Invoice Due',
    description: 'Gold sponsor invoice payment processing is pending clearance before catering deposit cutoff.',
    severity: 'medium',
    probability: 'low',
    status: 'mitigated',
    mitigationPlan: 'Priya sent invoice reminder with tax exemption documentation; sponsor confirmed payment transfer for Monday.',
    aiDetected: true,
    aiReasoning: 'Catering deposit deadline requires sponsorship funds in club account within 5 business days.',
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  }
];

const ANNOUNCEMENTS = [
  {
    title: 'Volunteer Briefing Tomorrow',
    content: 'All volunteers assigned to Google Cloud Hackathon 2026 please join our mandatory operational briefing tomorrow at 6:00 PM in the Innovation Lab.',
    targetAudience: 'volunteers',
    priority: 'high',
    status: 'published',
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  {
    title: 'Hackathon Registration Reminder',
    content: 'Early-bird team registrations for the 2026 Hackathon close this Friday at midnight. Submit your team roster and track preferences on ClubOps AI.',
    targetAudience: 'all',
    priority: 'normal',
    status: 'published',
    clubCode: 'TECH2026',
    eventTitle: 'Google Cloud Hackathon 2026'
  },
  // Isolation Club B Announcement
  {
    title: 'Drone Arena Setup Workshop',
    content: 'Robotics Society members please assemble at the Engineering Quad for LIDAR gate setup.',
    targetAudience: 'all',
    priority: 'normal',
    status: 'published',
    clubCode: 'ROBO2026',
    eventTitle: 'Autonomous Drone Challenge 2026'
  }
];

module.exports = {
  CLUBS,
  USERS,
  EVENTS,
  TASKS,
  MEETINGS,
  DOCUMENTS,
  RISKS,
  ANNOUNCEMENTS
};
