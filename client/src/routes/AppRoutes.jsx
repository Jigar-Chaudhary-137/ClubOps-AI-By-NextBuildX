import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EventsPage from '../pages/events/EventsPage';
import EventDetailsPage from '../pages/events/EventDetailsPage';
import TasksPage from '../pages/tasks/TasksPage';
import TaskDetailsPage from '../pages/tasks/TaskDetailsPage';
import VolunteersPage from '../pages/volunteers/VolunteersPage';
import VolunteerDetailsPage from '../pages/volunteers/VolunteerDetailsPage';
import MeetingsPage from '../pages/meetings/MeetingsPage';
import MeetingDetailsPage from '../pages/meetings/MeetingDetailsPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import DocumentDetailsPage from '../pages/documents/DocumentDetailsPage';
import RisksPage from '../pages/risks/RisksPage';
import RiskDetailsPage from '../pages/risks/RiskDetailsPage';
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage';
import AnnouncementDetailsPage from '../pages/announcements/AnnouncementDetailsPage';
import AICommandCenterPage from '../pages/ai/AICommandCenterPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirects to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Workspace App routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/volunteers/:volunteerId" element={<VolunteerDetailsPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/meetings/:meetingId" element={<MeetingDetailsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/risks/:riskId" element={<RiskDetailsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/announcements/:announcementId" element={<AnnouncementDetailsPage />} />
        <Route path="/ai" element={<AICommandCenterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
