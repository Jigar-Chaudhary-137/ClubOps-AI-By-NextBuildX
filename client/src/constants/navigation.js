import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Video,
  FileText,
  AlertTriangle,
  BellRing,
  Sparkles
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Central overview & key metrics'
  },
  {
    name: 'Events',
    path: '/events',
    icon: Calendar,
    description: 'Event planning & milestones'
  },
  {
    name: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    description: 'Task board, lists & deadlines'
  },
  {
    name: 'Volunteers',
    path: '/volunteers',
    icon: Users,
    description: 'Member roster & role allocation'
  },
  {
    name: 'Meetings',
    path: '/meetings',
    icon: Video,
    description: 'Notes, minutes & transcript ingestion'
  },
  {
    name: 'Documents',
    path: '/documents',
    icon: FileText,
    description: 'Club repository & knowledge base'
  },
  {
    name: 'Risks',
    path: '/risks',
    icon: AlertTriangle,
    description: 'Operational risk intelligence & alerts'
  },
  {
    name: 'Announcements',
    path: '/announcements',
    icon: BellRing,
    description: 'Broadcasts & messaging templates'
  },
  {
    name: 'AI Operations',
    path: '/ai',
    icon: Sparkles,
    description: 'Interactive agent & action executor',
    isAi: true
  }
];
