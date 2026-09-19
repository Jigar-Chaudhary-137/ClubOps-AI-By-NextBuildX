import React from 'react';
import { Users, UserPlus, Search, Filter, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Volunteer & Member Roster
            </h1>
            <Badge variant="primary">Team Directory</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Manage club member skillsets, role allocations, and task availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            disabled
          >
            Add Volunteer
          </Button>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search volunteers by name, department, or role..."
            leftIcon={<Search className="w-4 h-4" />}
            disabled
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" disabled leftIcon={<Filter className="w-4 h-4" />}>
            Filter Roles
          </Button>
        </div>
      </div>

      {/* Table Architecture Preview */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#263247] bg-[#111827]/60 text-xs font-semibold text-[#94A3B8]">
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Tasks</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-12">
                  <EmptyState
                    icon={<Users className="w-7 h-7 text-[#818CF8]" />}
                    title="No volunteers added yet"
                    description="Populate your club volunteer roster to assign tasks automatically during meeting note extraction."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
