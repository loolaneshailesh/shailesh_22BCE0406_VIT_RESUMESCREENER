import React from 'react';
import { PRESET_ROLES } from '../services/presetRoles';

interface PresetRolesSelectorProps {
  onSelect: (description: string) => void;
}

const PresetRolesSelector: React.FC<PresetRolesSelectorProps> = ({ onSelect }) => {
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = e.target.value;
    const selectedRole = PRESET_ROLES.find(role => role.title === selectedTitle);
    if (selectedRole) {
      onSelect(selectedRole.description);
    }
  };

  return (
    <div className="relative">
      <select
        onChange={handleSelectionChange}
        className="appearance-none w-full sm:w-auto bg-slate-800/50 border border-slate-600 text-slate-300 text-sm font-semibold rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
        defaultValue=""
      >
        <option value="" disabled>-- Select a Preset Role --</option>
        {PRESET_ROLES.map(role => (
          <option key={role.title} value={role.title}>
            {role.title}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.167 0 1.613l-3.694 3.664a1.12 1.12 0 01-1.58 0L5.516 9.16c-.436-.446-.436-1.167 0-1.613z" />
        </svg>
      </div>
    </div>
  );
};

export default PresetRolesSelector;
