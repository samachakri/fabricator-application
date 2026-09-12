'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  Banknote,
  ArrowRight,
  Users,
  Plus,
  Download,
  Search,
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
import { EditableHeader } from '@/components/sales/EditableHeader';
import {
  EditableCustomerCell,
  EditableProjectCell,
  EditablePriceCell,
  EditableOwnerCell,
} from '@/components/sales/EditableCell';
import { ProjectStatusDropdown } from '@/components/sales/ProjectStatusDropdown';

const STORAGE_KEY_CUSTOM_COLUMNS = 'fabricator_pro_sales_custom_columns_v1';
const STORAGE_KEY_COLUMN_ORDER = 'fabricator_pro_sales_column_order_v4';
const STORAGE_KEY_COLUMN_TITLES = 'fabricator_pro_sales_column_titles_v2';

const DEFAULT_SYSTEM_COLUMN_ORDER = [
  'customer',
  'project',
  'dealStage',
  'dealValue',
  'status',
  'owner',
];

const DEFAULT_COLUMN_TITLES: Record<string, string> = {
  customer: 'CUSTOMER & LOCATION',
  project: 'PROJECT & SPECIFICATIONS',
  dealStage: 'DEAL STAGE',
  dealValue: 'DEAL VALUE',
  status: 'STATUS',
  owner: 'OWNER',
};

export default function SalesPage() {
  const { projects, updateProject, deleteProject, deleteProjects } = useStore();
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [customColumns, setCustomColumns] = useState<CustomCRMColumn[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_SYSTEM_COLUMN_ORDER);
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>(DEFAULT_COLUMN_TITLES);
  const [activeTab, setActiveTab] = useState<
    'all' | 'quotes' | 'pending_payments' | 'won'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load column order, titles, and custom columns from localStorage
  React.useEffect(() => {
    try {
      const savedCols = localStorage.getItem(STORAGE_KEY_CUSTOM_COLUMNS);
      let loadedCols: CustomCRMColumn[] = [];
      if (savedCols) {
        loadedCols = JSON.parse(savedCols);
        setCustomColumns(loadedCols);
      } else {
        loadedCols = [
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
        setCustomColumns(loadedCols);
        localStorage.setItem(STORAGE_KEY_CUSTOM_COLUMNS, JSON.stringify(loadedCols));
      }

      const savedTitles = localStorage.getItem(STORAGE_KEY_COLUMN_TITLES);
      if (savedTitles) {
        setColumnTitles((prev) => ({ ...prev, ...JSON.parse(savedTitles) }));
      }

      const savedOrder = localStorage.getItem(STORAGE_KEY_COLUMN_ORDER);
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy 'lastActivity' column
          const clean = parsed.filter((id) => id !== 'lastActivity');
          // Ensure any custom columns are present
          loadedCols.forEach((c) => {
            if (!clean.includes(c.id)) clean.push(c.id);
          });
          setColumnOrder(clean);
        }
      } else {
        const fullDefault = [...DEFAULT_SYSTEM_COLUMN_ORDER, ...loadedCols.map((c) => c.id)];
        setColumnOrder(fullDefault);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const moveColumn = (colId: string, direction: 'left' | 'right') => {
    const currentIndex = columnOrder.indexOf(colId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columnOrder.length) return;
    const updated = [...columnOrder];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setColumnOrder(updated);
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameColumn = (colId: string, newTitle: string) => {
    const updated = { ...columnTitles, [colId]: newTitle };
    setColumnTitles(updated);
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_TITLES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

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
    if (!columnOrder.includes(newCol.id)) {
      const newOrder = [...columnOrder, newCol.id];
      setColumnOrder(newOrder);
      try {
        localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(newOrder));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const DELETABLE_SYSTEM_COLUMNS = ['dealValue', 'dealStage', 'status', 'owner'];
  const missingSystemColumns = useMemo(() => {
    return DELETABLE_SYSTEM_COLUMNS.filter((id) => !columnOrder.includes(id));
  }, [columnOrder]);

  const handleRestoreSystemColumn = (colId: string) => {
    if (!columnOrder.includes(colId)) {
      const newOrder = [...columnOrder, colId];
      setColumnOrder(newOrder);
      try {
        localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(newOrder));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteColumn = (colId: string) => {
    const colTitle =
      columnTitles[colId] ||
      DEFAULT_COLUMN_TITLES[colId] ||
      customColumns.find((c) => c.id === colId)?.name ||
      colId;

    if (window.confirm(`Are you sure you want to remove the "${colTitle}" column?`)) {
      const updated = customColumns.filter((c) => c.id !== colId);
      saveColumns(updated);
      const newOrder = columnOrder.filter((id) => id !== colId);
      setColumnOrder(newOrder);
      try {
        localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(newOrder));
      } catch (e) {
        console.error(e);
      }
    }
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

  const handleDeleteSingleProject = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${projectName}"?`)) {
      deleteProject(projectId);
    }
  };

  // Dynamic Pending Payments Count
  const pendingPaymentsCount = useMemo(() => {
    return projects.filter((p) => {
      const stageLower = (p.dealStage || '').toLowerCase();
      const statusLower = (p.status || '').toLowerCase();
      const customPay = String(p.customFields?.['col_payment_status'] || '').toLowerCase();
      return (
        stageLower.includes('pending') ||
        statusLower.includes('pending') ||
        customPay.includes('pending') ||
        p.dealStage === 'Advance Pending' ||
        p.status === 'Advance Pending'
      );
    }).length;
  }, [projects]);

  // KPI Calculations matching screenshot
  const totalPipelineValue = '₹34.8 L';
  const activeLeadsCount = 24;
  const pendingQuotesCount = 9;
  const winRate = '34%';

  // Filter projects by tab & search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Tab filter
      if (activeTab === 'quotes') {
        if (
          p.dealStage !== 'Quotation Sent' &&
          p.status !== 'Quotation Sent'
        ) {
          return false;
        }
      } else if (activeTab === 'pending_payments') {
        const stageLower = (p.dealStage || '').toLowerCase();
        const statusLower = (p.status || '').toLowerCase();
        const customPay = String(p.customFields?.['col_payment_status'] || '').toLowerCase();
        const isPending =
          stageLower.includes('pending') ||
          statusLower.includes('pending') ||
          customPay.includes('pending') ||
          p.dealStage === 'Advance Pending' ||
          p.status === 'Advance Pending';
        if (!isPending) return false;
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


  const getCustomColIcon = (type?: CustomCRMColumn['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-3 h-3 text-blue-600" />;
      case 'number':
        return <Hash className="w-3 h-3 text-emerald-600" />;
      case 'mail':
        return <Mail className="w-3 h-3 text-amber-600" />;
      case 'status':
        return <Tag className="w-3 h-3 text-purple-600" />;
      default:
        return null;
    }
  };

  const renderTableCell = (
    colId: string,
    p: (typeof projects)[0],
    idx: number,
    initials: string,
    hasDesign: boolean
  ) => {
    switch (colId) {
      case 'customer':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle">
            <EditableCustomerCell
              name={p.customer.name}
              phone={p.customer.phone}
              location={p.location || p.customer.address}
              initials={initials}
              avatarBg={getAvatarBg(idx)}
              onSave={({ name, phone, location }) =>
                updateProject(p.id, {
                  customer: {
                    ...p.customer,
                    name: name ?? p.customer.name,
                    phone: phone ?? p.customer.phone,
                    address: location ?? p.customer.address,
                  },
                  location: location ?? p.location,
                })
              }
            />
          </td>
        );

      case 'project':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle">
            <EditableProjectCell
              projectId={p.id}
              name={p.name}
              specs={
                p.specSummary ||
                (hasDesign
                  ? `${p.windows.length} Windows (${p.windows[0]?.profileBrand || 'uPVC'})`
                  : 'Pending Window Measurements')
              }
              onSave={({ name, specSummary }) =>
                updateProject(p.id, {
                  name: name ?? p.name,
                  specSummary: specSummary ?? p.specSummary,
                })
              }
            />
          </td>
        );

      case 'dealStage':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
            <DealStageDropdown
              currentStage={p.dealStage}
              onSelectStage={(newStage) =>
                updateProject(p.id, { dealStage: newStage })
              }
            />
          </td>
        );

      case 'dealValue':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
            <EditablePriceCell
              value={p.estimatedValue}
              onSave={(val) => updateProject(p.id, { estimatedValue: val })}
            />
          </td>
        );

      case 'status':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
            <ProjectStatusDropdown
              currentStatus={p.status || 'Designing'}
              onSelectStatus={(newStatus) =>
                updateProject(p.id, { status: newStatus })
              }
            />
          </td>
        );

      case 'owner':
        return (
          <td key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
            <EditableOwnerCell
              ownerName={p.dealOwner?.name || 'Chakri S.'}
              avatar={p.dealOwner?.avatar || 'CS'}
              color={p.dealOwner?.color || 'bg-[#0A2E8A]'}
              onSave={(newName) =>
                updateProject(p.id, {
                  dealOwner: {
                    ...(p.dealOwner || {}),
                    name: newName,
                    avatar: newName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase(),
                    color: p.dealOwner?.color || 'bg-[#0A2E8A]',
                  },
                })
              }
            />
          </td>
        );

      default: {
        const customCol = customColumns.find((c) => c.id === colId);
        if (customCol) {
          return (
            <td key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
              <CRMCell
                column={customCol}
                value={p.customFields?.[customCol.id]}
                onSave={(val) => handleSaveCell(p.id, customCol.id, val)}
                onAddOptionToColumn={handleAddOptionToColumn}
                onDeleteOptionFromColumn={handleDeleteOptionFromColumn}
              />
            </td>
          );
        }
        return <td key={colId} className="px-4 py-3.5 text-left align-middle"></td>;
      }
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

      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onAddColumn={handleAddColumn}
        availableSystemColumns={missingSystemColumns}
        onRestoreSystemColumn={handleRestoreSystemColumn}
        columnTitles={columnTitles}
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
            onClick={() => setActiveTab('pending_payments')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending_payments'
                ? 'bg-[#0A2E8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Pending Payments</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'pending_payments'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingPaymentsCount}
            </span>
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
        </div>
      </div>



      {/* 5. Main Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                {/* Dynamic Reorderable & Editable Column Headers */}
                {columnOrder.map((colId, index) => {
                  const customCol = customColumns.find((c) => c.id === colId);
                  const title =
                    columnTitles[colId] ||
                    customCol?.name ||
                    DEFAULT_COLUMN_TITLES[colId] ||
                    colId;
                  const isCustom = !!customCol;
                  const icon = customCol ? getCustomColIcon(customCol.type) : undefined;
                  const isDeletable = colId !== 'customer' && colId !== 'project';

                  return (
                    <th key={colId} className="px-4 py-3.5 text-left align-middle whitespace-nowrap">
                      <EditableHeader
                        columnId={colId}
                        title={title}
                        icon={icon}
                        isCustom={isCustom}
                        canMoveLeft={index > 0}
                        canMoveRight={index < columnOrder.length - 1}
                        onMoveLeft={() => moveColumn(colId, 'left')}
                        onMoveRight={() => moveColumn(colId, 'right')}
                        onRename={(newTitle) => handleRenameColumn(colId, newTitle)}
                        onDelete={isDeletable ? () => handleDeleteColumn(colId) : undefined}
                      />
                    </th>
                  );
                })}

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
                <th className="px-4 py-3.5 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProjects.map((p, idx) => {
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
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Dynamically ordered Excel-like editable table cells */}
                    {columnOrder.map((colId) =>
                      renderTableCell(colId, p, idx, initials, hasDesign)
                    )}

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
              Showing {Math.min((currentPage - 1) * 10 + 1, 38)}-
              {Math.min(currentPage * 10, 38)} of 38 leads
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none cursor-pointer">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Prev button: ONLY shown when user is on 2nd page or higher */}
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                title="Go to previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {[1, 2, 3, 4].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#0A2E8A] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {currentPage < 4 && (
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(4, prev + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                title="Go to next page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
