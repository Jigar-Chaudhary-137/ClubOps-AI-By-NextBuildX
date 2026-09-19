import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EventsPage from '../pages/events/EventsPage';
import TasksPage from '../pages/tasks/TasksPage';
import VolunteersPage from '../pages/volunteers/VolunteersPage';
import MeetingsPage from '../pages/meetings/MeetingsPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import RisksPage from '../pages/risks/RisksPage';
import AnnouncementsPage from '../pages/announcements/AnnouncementsPage';
import AIAssistantPage from '../pages/ai/AIAssistantPage';
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
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
