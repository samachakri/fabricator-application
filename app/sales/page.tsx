'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  Banknote,
  ArrowRight,
  Users,
  Plus,
  SlidersHorizontal,
  Download,
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Calendar,
  Compass,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Type,
  Hash,
  Tag,
  Trash2,
} from 'lucide-react';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { DealStage, CustomCRMColumn } from '@/lib/types';
import { DealStageDropdown } from '@/components/sales/DealStageDropdown';
import { AddColumnModal } from '@/components/sales/AddColumnModal';
import { CRMCell } from '@/components/sales/CRMCell';

const STORAGE_KEY_CUSTOM_COLUMNS = 'fabricator_pro_sales_custom_columns_v1';

export default function SalesPage() {
  const { projects, updateProject, deleteProject, deleteProjects } = useStore();
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [customColumns, setCustomColumns] = useState<CustomCRMColumn[]>([]);
  const [activeTab, setActiveTab] = useState<
    'all' | 'open' | 'quotes' | 'won'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Load custom columns from localStorage or set defaults
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_COLUMNS);
      if (saved) {
        setCustomColumns(JSON.parse(saved));
      } else {
        const initialCols: CustomCRMColumn[] = [
          {
            id: 'col_payment_status',
            name: 'Payment Status',
            type: 'status',
            options: ['Advance Pending', '50% Received', '100% Cleared'],
          },
          {
            id: 'col_client_email',
            name: 'Client Email',
            type: 'mail',
          },
        ];
        setCustomColumns(initialCols);
        localStorage.setItem(STORAGE_KEY_CUSTOM_COLUMNS, JSON.stringify(initialCols));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveColumns = (cols: CustomCRMColumn[]) => {
    setCustomColumns(cols);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_COLUMNS, JSON.stringify(cols));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddColumn = (newCol: CustomCRMColumn) => {
    const updated = [...customColumns, newCol];
    saveColumns(updated);
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = customColumns.filter((c) => c.id !== colId);
    saveColumns(updated);
  };

  const handleAddOptionToColumn = (colId: string, newOption: string) => {
    const updated = customColumns.map((c) => {
      if (c.id !== colId) return c;
      const opts = c.options || [];
      if (opts.includes(newOption)) return c;
      return { ...c, options: [...opts, newOption] };
    });
    saveColumns(updated);
  };

  const handleSaveCell = (projectId: string, colId: string, val: any) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const customFields = { ...(proj.customFields || {}), [colId]: val };
    updateProject(projectId, { customFields });
  };

  const handleDeleteOptionFromColumn = (colId: string, optionToDelete: string) => {
    const updated = customColumns.map((c) => {
      if (c.id !== colId) return c;
      const opts = c.options || [];
      return { ...c, options: opts.filter((o) => o !== optionToDelete) };
    });
    saveColumns(updated);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) {
      deleteProjects(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleDeleteSingleProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${projectName}"?`)) {
      deleteProject(projectId);
      setSelectedIds((prev) => prev.filter((id) => id !== projectId));
    }
  };

  // KPI Calculations matching screenshot
  const totalPipelineValue = '₹34.8 L';
  const activeLeadsCount = 24;
  const pendingQuotesCount = 9;
  const winRate = '34%';

  // Filter projects by tab & search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Tab filter
      if (activeTab === 'open') {
        if (
          p.dealStage === 'Won - In Production' ||
          p.status === 'Completed'
        ) {
          return false;
        }
      } else if (activeTab === 'quotes') {
        if (
          p.dealStage !== 'Quotation Sent' &&
          p.status !== 'Quotation Sent'
        ) {
          return false;
        }
      } else if (activeTab === 'won') {
        if (
          p.dealStage !== 'Won - In Production' &&
          p.status !== 'In Production' &&
          p.status !== 'Completed'
        ) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.customer.name.toLowerCase().includes(query);
        const matchesProject = p.name.toLowerCase().includes(query);
        const matchesLocation = (p.location || p.siteAddress)
          .toLowerCase()
          .includes(query);
        const matchesPhone = p.customer.phone.includes(query);
        if (
          !matchesName &&
          !matchesProject &&
          !matchesLocation &&
          !matchesPhone
        ) {
          return false;
        }
      }

      return true;
    });
  }, [projects, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getAvatarBg = (index: number) => {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-orange-100 text-orange-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-slate-200 text-slate-700',
      'bg-sky-100 text-sky-700',
      'bg-amber-100 text-amber-700',
    ];
    return colors[index % colors.length];
  };


  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'mail':
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-slate-500" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-slate-500" />;
      case 'cad':
        return <Compass className="w-3.5 h-3.5 text-blue-600" />;
      case 'eye':
        return <Eye className="w-3.5 h-3.5 text-slate-500" />;
      case 'payment':
        return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'clock':
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span>FabricatorPro</span>
        <span>›</span>
        <span className="text-slate-600 font-semibold">Sales & Pipeline</span>
      </div>

      {/* 2. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Leads & Deals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer inquiries, quotation status, and deal values.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filters button with blue dot */}
          <button className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
          </button>

          {/* Export button */}
          <button className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* + New Lead / Project Button */}
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="bg-[#0A2E8A] hover:bg-[#08256E] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead / Project</span>
          </button>
        </div>
      </div>

      {/* Modal for adding new lead */}
      <NewProjectModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
      />

      {/* Modal for adding new CRM column */}
      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onAddColumn={handleAddColumn}
      />

      {/* 3. Top 4 Metric KPI Cards matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pipeline Value */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pipeline Value
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
              ₹
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPipelineValue}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↗ +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            From 38 active opportunities
          </p>
        </div>

        {/* Card 2: Active Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Leads
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {activeLeadsCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              In Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            6 new inquiries this week
          </p>
        </div>

        {/* Card 3: Pending Quotations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pending Quotations
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {pendingQuotesCount}
            </span>
            <span className="text-xs font-semibold text-blue-700">
              ₹12.4 L value
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Awaiting client signoff
          </p>
        </div>

        {/* Card 4: Win Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Win Rate
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {winRate}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↗ +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on last 90 days
          </p>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Leads ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'open'
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Open Deals (24)
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'quotes'
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quotations Sent (9)
          </button>
          <button
            onClick={() => setActiveTab('won')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'won'
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Won / Converted (5)
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table'
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md ${
                viewMode === 'cards'
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Delete Bar when checkboxes are checked */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              ✓
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-sm tracking-tight">
                {selectedIds.length} {selectedIds.length === 1 ? 'Lead' : 'Leads'} Selected
              </span>
              <span className="text-xs text-slate-400 hidden md:inline">
                Perform batch actions across checked rows
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium cursor-pointer"
            >
              Cancel Selection
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-12">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredProjects.length &&
                        filteredProjects.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#0A2E8A] focus:ring-0 cursor-pointer"
                    />
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                        title={`Delete ${selectedIds.length} selected lead(s)`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3.5">CUSTOMER & LOCATION</th>
                <th className="px-4 py-3.5">PROJECT & SPECIFICATIONS</th>
                <th className="px-4 py-3.5">DEAL STAGE</th>
                <th className="px-4 py-3.5">DEAL VALUE</th>
                <th className="px-4 py-3.5">OWNER</th>
                <th className="px-4 py-3.5">LAST ACTIVITY</th>
                {/* Dynamic Custom CRM Columns */}
                {customColumns.map((col) => (
                  <th key={col.id} className="px-4 py-3.5 group/th whitespace-nowrap bg-slate-50/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {col.type === 'text' && <Type className="w-3 h-3 text-blue-600" />}
                        {col.type === 'number' && <Hash className="w-3 h-3 text-emerald-600" />}
                        {col.type === 'mail' && <Mail className="w-3 h-3 text-amber-600" />}
                        {col.type === 'status' && <Tag className="w-3 h-3 text-purple-600" />}
                        <span className="text-slate-800 font-extrabold uppercase text-[10px] tracking-wider">
                          {col.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteColumn(col.id)}
                        className="opacity-0 group-hover/th:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        title={`Delete ${col.name} column`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
                {/* + Add Column Button in Header */}
                <th className="px-3 py-3.5 w-28 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setIsAddColumnOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#0A2E8A] hover:text-[#08256E] bg-blue-50/80 hover:bg-blue-100 rounded-lg border border-blue-200/60 transition-colors shadow-2xs cursor-pointer"
                    title="Add new CRM column"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Column</span>
                  </button>
                </th>
                <th className="px-4 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProjects.map((p, idx) => {
                const isChecked = selectedIds.includes(p.id);

                // Derive initials
                const initials = p.customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                // Has window design or not
                const hasDesign = p.windows && p.windows.length > 0;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChecked ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-slate-300 text-[#0A2E8A] focus:ring-0"
                      />
                    </td>

                    {/* Customer & Location */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(
                            idx
                          )}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {p.customer.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {p.customer.phone}{' '}
                            <span className="text-slate-300">•</span>{' '}
                            {p.location || p.customer.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project & Specifications */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/projects/${p.id}/design/W01`}
                        className="font-bold text-slate-900 hover:text-[#0A2E8A] transition-colors"
                      >
                        {p.name}
                      </Link>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.specSummary ||
                          (hasDesign
                            ? `${p.windows.length} Windows (${p.windows[0]?.profileBrand || 'uPVC'})`
                            : 'Pending Window Measurements')}
                      </div>
                    </td>

                    {/* Deal Stage Pill with interactive dropdown */}
                    <td className="px-4 py-4">
                      <DealStageDropdown
                        currentStage={p.dealStage}
                        onSelectStage={(newStage) =>
                          updateProject(p.id, { dealStage: newStage })
                        }
                      />
                    </td>

                    {/* Deal Value */}
                    <td className="px-4 py-4 font-mono font-bold text-slate-900 text-xs">
                      ₹{p.estimatedValue.toLocaleString()}
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                            p.dealOwner?.color || 'bg-[#0A2E8A]'
                          }`}
                        >
                          {p.dealOwner?.avatar || 'CS'}
                        </div>
                        <span className="text-xs text-slate-700">
                          {p.dealOwner?.name || 'Chakri S.'}
                        </span>
                      </div>
                    </td>

                    {/* Last Activity with icon */}
                    <td className="px-4 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {getActivityIcon(p.lastActivity?.type)}
                        <span>
                          {p.lastActivity?.text || 'Inquired recently'}
                        </span>
                      </div>
                    </td>

                    {/* Dynamic Custom CRM Cells */}
                    {customColumns.map((col) => (
                      <td key={col.id} className="px-4 py-4 whitespace-nowrap">
                        <CRMCell
                          column={col}
                          value={p.customFields?.[col.id]}
                          onSave={(val) => handleSaveCell(p.id, col.id, val)}
                          onAddOptionToColumn={handleAddOptionToColumn}
                          onDeleteOptionFromColumn={handleDeleteOptionFromColumn}
                        />
                      </td>
                    ))}

                    {/* Spacer cell aligning with + Add Column header */}
                    <td className="px-3 py-4 w-28"></td>

                    {/* Actions Column: If no design -> Send Quotation (Design First), else View Quote, plus Delete button */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {!hasDesign ? (
                          <Link
                            href={`/projects/${p.id}/design/W01`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0A2E8A] hover:bg-[#08256E] rounded-xl shadow-sm transition-all whitespace-nowrap"
                            title="Design window dimensions with 2D CAD first to generate commercial quote"
                          >
                            <span>Send Quotation</span>
                            <span className="text-[10px] font-normal text-blue-200">
                              (Design First)
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/projects/${p.id}/quotation`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
                          >
                            <span>View Quote</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteSingleProject(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title={`Delete lead "${p.name}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer matching Screenshot */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing 1-{filteredProjects.length} of 38 leads
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#0A2E8A] text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-center">
              2
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-center">
              3
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-center">
              4
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
