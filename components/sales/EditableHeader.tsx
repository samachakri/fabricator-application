'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Check, X, Trash2 } from 'lucide-react';

interface EditableHeaderProps {
  columnId: string;
  title: string;
  icon?: React.ReactNode;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRename: (newTitle: string) => void;
  onDelete?: () => void;
  isCustom?: boolean;
}

export const EditableHeader: React.FC<EditableHeaderProps> = ({
  columnId,
  title,
  icon,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onRename,
  onDelete,
  isCustom = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="group/header flex items-center justify-between gap-1 py-0.5 select-none">
      {/* Left Reorder Arrow */}
      <button
        type="button"
        disabled={!canMoveLeft}
        onClick={(e) => {
          e.stopPropagation();
          onMoveLeft();
        }}
        className={`p-0.5 rounded transition-colors ${
          canMoveLeft
            ? 'text-slate-400 hover:text-[#0A2E8A] hover:bg-blue-50 cursor-pointer opacity-0 group-hover/header:opacity-100'
            : 'opacity-0 cursor-default'
        }`}
        title="Move column left"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Main Title / Editable Input */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
        {icon && <span className="shrink-0">{icon}</span>}
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-white border border-[#0A2E8A] rounded focus:outline-none ring-1 ring-[#0A2E8A] text-slate-900 min-w-[80px]"
            />
            <button
              type="button"
              onMouseDown={commitRename}
              className="p-0.5 text-emerald-600 hover:text-emerald-700"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="flex items-center gap-1 cursor-pointer py-0.5 px-1 rounded hover:bg-slate-200/50 transition-colors truncate"
            title="Double-click or click pencil to edit heading"
          >
            <span className="truncate font-extrabold uppercase text-[10px] tracking-wider text-slate-700">
              {title}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="opacity-0 group-hover/header:opacity-100 p-0.5 text-slate-400 hover:text-[#0A2E8A] transition-opacity"
              title="Rename column heading"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right Reorder Arrow & Optional Custom Delete */}
      <div className="flex items-center gap-0.5 shrink-0">
        {isCustom && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover/header:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-opacity"
            title="Delete column"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          disabled={!canMoveRight}
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight();
          }}
          className={`p-0.5 rounded transition-colors ${
            canMoveRight
              ? 'text-slate-400 hover:text-[#0A2E8A] hover:bg-blue-50 cursor-pointer opacity-0 group-hover/header:opacity-100'
              : 'opacity-0 cursor-default'
          }`}
          title="Move column right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
