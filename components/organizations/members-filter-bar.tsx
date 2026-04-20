import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AllMemberStatus, AllOrganizationRole } from "@/lib/api/types";
import { Search, Filter, UserCog } from "lucide-react";

interface MembersFilterBarProps {
  status: AllMemberStatus;
  role: AllOrganizationRole;
  search: string;
  onStatusChange: (status: AllMemberStatus) => void;
  onRoleChange: (role: AllOrganizationRole) => void;
  onSearchChange: (search: string) => void;
}

export function MembersFilterBar({
  status,
  role,
  search,
  onStatusChange,
  onRoleChange,
  onSearchChange,
}: MembersFilterBarProps) {
  return (
    <div className="card members-filter-bar">
      <div className="members-search-wrapper">
        <Search className="members-search-icon" size={18} />
        <Input
          placeholder="Search members by name or email..."
          className="members-search-input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="members-filter-divider" />

      <div className="members-filters">
        <div className="members-filter-item">
          <Filter size={14} className="members-filter-icon" />
          <span className="members-filter-label">Status</span>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as AllMemberStatus)}
            className="members-filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="REMOVED">Removed</option>
          </Select>
        </div>

        <div className="members-filter-item">
          <UserCog size={14} className="members-filter-icon" />
          <span className="members-filter-label">Role</span>
          <Select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as AllOrganizationRole)}
            className="members-filter-select"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
