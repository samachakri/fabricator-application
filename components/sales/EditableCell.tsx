'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check } from 'lucide-react';

interface EditablePriceCellProps {
  value: number;
  onSave: (newVal: number) => void;
}

export const EditablePriceCell: React.FC<EditablePriceCellProps> = ({
  value,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(String(value || 0));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAmount(String(value || 0));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    const num = parseFloat(amount);
    onSave(isNaN(num) ? 0 : Math.max(0, num));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-slate-500">₹</span>
        <input
          ref={inputRef}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setAmount(String(value || 0));
              setIsEditing(false);
            }
          }}
          className="w-24 px-1.5 py-0.5 text-xs font-mono font-bold bg-white border border-[#0A2E8A] rounded focus:outline-none ring-1 ring-[#0A2E8A] text-right"
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer group flex items-center justify-between gap-1.5 py-1 rounded hover:bg-slate-100/70 transition-colors"
      title="Click to edit price"
    >
      <span className="font-mono font-bold text-slate-900 text-xs">
        ₹{Number(value || 0).toLocaleString()}
      </span>
      <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

interface EditableCustomerCellProps {
  name: string;
  phone: string;
  location: string;
  initials: string;
  avatarBg: string;
  onSave: (updates: { name?: string; phone?: string; location?: string }) => void;
}

export const EditableCustomerCell: React.FC<EditableCustomerCellProps> = ({
  name,
  phone,
  location,
  initials,
  avatarBg,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editPhone, setEditPhone] = useState(phone);
  const [editLocation, setEditLocation] = useState(location);

  useEffect(() => {
    setEditName(name);
    setEditPhone(phone);
    setEditLocation(location);
  }, [name, phone, location]);

  const commit = () => {
    onSave({
      name: editName.trim() || name,
      phone: editPhone.trim() || phone,
      location: editLocation.trim() || location,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 bg-white rounded-xl shadow-lg border border-[#0A2E8A] space-y-1.5 min-w-[200px] z-20 relative">
        <input
          type="text"
          autoFocus
          placeholder="Customer Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={editPhone}
          onChange={(e) => setEditPhone(e.target.value)}
          className="w-full px-2 py-0.5 text-[11px] border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
        />
        <input
          type="text"
          placeholder="Location / Address"
          value={editLocation}
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-full px-2 py-0.5 text-[11px] border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
        />
        <div className="flex justify-end gap-1 pt-1">
          <button
            type="button"
            onClick={() => {
              setEditName(name);
              setEditPhone(phone);
              setEditLocation(location);
              setIsEditing(false);
            }}
            className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            className="px-2.5 py-0.5 text-[10px] font-bold bg-[#0A2E8A] text-white rounded hover:bg-[#08256E]"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer group flex items-center gap-3 py-1 rounded hover:bg-slate-100/70 transition-colors"
      title="Click to edit customer details"
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarBg}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-slate-900 text-xs truncate">{name}</span>
          <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
        <div className="text-[11px] text-slate-500 truncate mt-0.5">
          {phone} <span className="text-slate-300">•</span> {location}
        </div>
      </div>
    </div>
  );
};

interface EditableProjectCellProps {
  name: string;
  specs: string;
  projectId: string;
  onSave: (updates: { name?: string; specSummary?: string }) => void;
}

export const EditableProjectCell: React.FC<EditableProjectCellProps> = ({
  name,
  specs,
  projectId,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editSpecs, setEditSpecs] = useState(specs);

  useEffect(() => {
    setEditName(name);
    setEditSpecs(specs);
  }, [name, specs]);

  const commit = () => {
    onSave({
      name: editName.trim() || name,
      specSummary: editSpecs.trim() || specs,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 bg-white rounded-xl shadow-lg border border-[#0A2E8A] space-y-1.5 min-w-[200px] z-20 relative">
        <input
          type="text"
          autoFocus
          placeholder="Project Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
        />
        <input
          type="text"
          placeholder="Specifications"
          value={editSpecs}
          onChange={(e) => setEditSpecs(e.target.value)}
          className="w-full px-2 py-0.5 text-[11px] border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
        />
        <div className="flex justify-end gap-1 pt-1">
          <button
            type="button"
            onClick={() => {
              setEditName(name);
              setEditSpecs(specs);
              setIsEditing(false);
            }}
            className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            className="px-2.5 py-0.5 text-[10px] font-bold bg-[#0A2E8A] text-white rounded hover:bg-[#08256E]"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer group py-1 rounded hover:bg-slate-100/70 transition-colors"
      title="Click to edit project details"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-bold text-slate-900 hover:text-[#0A2E8A] text-xs truncate">
          {name}
        </span>
        <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
      <div className="text-[11px] text-slate-500 truncate mt-0.5">{specs}</div>
    </div>
  );
};

interface EditableOwnerCellProps {
  ownerName: string;
  avatar: string;
  color?: string;
  onSave: (newName: string) => void;
}

export const EditableOwnerCell: React.FC<EditableOwnerCellProps> = ({
  ownerName,
  avatar,
  color = 'bg-[#0A2E8A]',
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(ownerName);

  useEffect(() => {
    setName(ownerName);
  }, [ownerName]);

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setName(ownerName);
            setIsEditing(false);
          }
        }}
        className="w-28 px-1.5 py-0.5 text-xs border border-[#0A2E8A] rounded focus:outline-none ring-1 ring-[#0A2E8A]"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer group flex items-center justify-between gap-2 py-1 rounded hover:bg-slate-100/70 transition-colors"
      title="Click to edit owner"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${color}`}
        >
          {avatar}
        </div>
        <span className="text-xs text-slate-700 truncate">{ownerName}</span>
      </div>
      <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
};
