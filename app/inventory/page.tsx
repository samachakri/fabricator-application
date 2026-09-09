'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useBranding } from '@/lib/branding-store';
import { InventoryItem } from '@/lib/types';
import AddInventoryModal from '@/components/modals/AddInventoryModal';
import StockMovementModal from '@/components/modals/StockMovementModal';
import EditItemModal from '@/components/modals/EditItemModal';
import QuickReorderModal from '@/components/modals/QuickReorderModal';
import { ProUpgradeModal } from '@/components/modals/ProUpgradeModal';
import {
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  Edit3,
  ArrowUpDown,
  CheckCircle2,
  Truck,
  Warehouse,
  ShieldCheck,
  Scissors,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Clock,
  ChevronRight,
  Box,
  Wrench,
  Sparkles,
} from 'lucide-react';

export default function InventoryPage() {
  const { inventory } = useStore();
  const { branding } = useBranding();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementSelectedId, setMovementSelectedId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSelectedItem, setEditSelectedItem] = useState<InventoryItem | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderSelectedItem, setReorderSelectedItem] = useState<InventoryItem | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Filter and Search states
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // QC inspection modal state or interactive notice
  const [qcNotice, setQcNotice] = useState<string | null>(null);

  // Tabs definitions
  const tabs = [
    { id: 'all', label: 'All Inventory', count: inventory.length },
    {
      id: 'casement',
      label: 'Casement Series',
      count: inventory.filter(
        (i) => i.seriesCategory === 'casement' || i.seriesClassification?.toLowerCase().includes('casement')
      ).length,
    },
    {
      id: 'sliding',
      label: 'Sliding Series',
      count: inventory.filter(
        (i) => i.seriesCategory === 'sliding' || i.seriesClassification?.toLowerCase().includes('sliding')
      ).length,
    },
    {
      id: 'tilt_turn',
      label: 'Tilt & Turn Series',
      count: inventory.filter(
        (i) => i.seriesCategory === 'tilt_turn' || i.seriesClassification?.toLowerCase().includes('tilt')
      ).length,
    },
    {
      id: 'hardware',
      label: 'Hardware & Fittings',
      count: inventory.filter(
        (i) =>
          i.seriesCategory === 'hardware' ||
          i.category === 'Hardware' ||
          i.seriesClassification?.toLowerCase().includes('hardware')
      ).length,
    },
    {
      id: 'glass_steel',
      label: 'Glass Sheets & Steel',
      count: inventory.filter(
        (i) =>
          i.seriesCategory === 'glass_steel' ||
          i.category === 'Glass' ||
          i.seriesClassification?.toLowerCase().includes('glass') ||
          i.seriesClassification?.toLowerCase().includes('steel')
      ).length,
    },
  ];

  // Brand dropdown options
  const brandsList = useMemo(() => {
    const list = new Set<string>();
    inventory.forEach((i) => {
      if (i.brandName) list.add(i.brandName);
    });
    return ['All', ...Array.from(list)];
  }, [inventory]);

  // Unit dropdown options
  const unitsList = useMemo(() => {
    const list = new Set<string>();
    inventory.forEach((i) => {
      if (i.unit) list.add(i.unit);
    });
    return ['All', ...Array.from(list)];
  }, [inventory]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      // Tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'casement') {
          const isCasement =
            item.seriesCategory === 'casement' ||
            item.seriesClassification?.toLowerCase().includes('casement');
          if (!isCasement) return false;
        } else if (activeTab === 'sliding') {
          const isSliding =
            item.seriesCategory === 'sliding' ||
            item.seriesClassification?.toLowerCase().includes('sliding');
          if (!isSliding) return false;
        } else if (activeTab === 'tilt_turn') {
          const isTilt =
            item.seriesCategory === 'tilt_turn' ||
            item.seriesClassification?.toLowerCase().includes('tilt');
          if (!isTilt) return false;
        } else if (activeTab === 'hardware') {
          const isHw =
            item.seriesCategory === 'hardware' ||
            item.category === 'Hardware' ||
            item.seriesClassification?.toLowerCase().includes('hardware');
          if (!isHw) return false;
        } else if (activeTab === 'glass_steel') {
          const isGs =
            item.seriesCategory === 'glass_steel' ||
            item.category === 'Glass' ||
            item.seriesClassification?.toLowerCase().includes('glass') ||
            item.seriesClassification?.toLowerCase().includes('steel');
          if (!isGs) return false;
        }
      }

      // Brand filter
      if (brandFilter !== 'All' && item.brandName !== brandFilter) {
        return false;
      }

      // Unit filter
      if (unitFilter !== 'All' && item.unit !== unitFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSpec = item.specSubtitle?.toLowerCase().includes(q);
        const matchesBrand = item.brandName?.toLowerCase().includes(q);
        const matchesRack = item.rackLocation?.toLowerCase().includes(q);
        const matchesSeries = item.seriesClassification?.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesBrand && !matchesRack && !matchesSeries) {
          return false;
        }
      }

      return true;
    });
  }, [inventory, activeTab, brandFilter, unitFilter, statusFilter, searchQuery]);

  // Overall KPIs calculation
  const { totalExtrusionsLength, lowStockCount, totalValuationAmount } = useMemo(() => {
    let extrusionMeters = 0;
    let lowCount = 0;
    let totalVal = 0;

    inventory.forEach((i) => {
      totalVal += i.currentStock * i.unitPrice;
      if (i.status === 'Low Stock' || i.currentStock <= i.minStock) {
        lowCount += 1;
      }
      if (i.unit === 'm') {
        extrusionMeters += i.currentStock;
      }
    });

    return {
      totalExtrusionsLength: extrusionMeters,
      lowStockCount: lowCount,
      totalValuationAmount: totalVal,
    };
  }, [inventory]);

  // Format valuation in Lakhs
  const formattedValuation = useMemo(() => {
    if (totalValuationAmount >= 100000) {
      return `₹${(totalValuationAmount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${totalValuationAmount.toLocaleString('en-IN')}`;
  }, [totalValuationAmount]);

  // Toggle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInventory.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'Item ID',
      'Material / Profile Name',
      'Specification',
      'Series Classification',
      'Brand / Manufacturer',
      'Rack Location',
      'Stock On Hand',
      'Unit',
      'Min Reorder Level',
      'Unit Purchase Price (INR)',
      'Total Valuation (INR)',
      'Stock Status',
    ];

    const rows = filteredInventory.map((item) => [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${(item.specSubtitle || '').replace(/"/g, '""')}"`,
      `"${item.seriesClassification || item.category}"`,
      `"${item.brandName || ''}"`,
      `"${item.rackLocation || ''}"`,
      item.currentStock,
      `"${item.unit}"`,
      item.minStock,
      item.unitPrice,
      item.currentStock * item.unitPrice,
      `"${item.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `FabricatorPro_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for item icon rendering
  const getItemIcon = (item: InventoryItem) => {
    const type = item.iconType || (item.category === 'Hardware' ? 'hardware' : item.category === 'Glass' ? 'glass' : 'profile');
    switch (type) {
      case 'steel':
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        );
      case 'glass':
        return (
          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center shrink-0">
            <Box className="w-5 h-5" />
          </div>
        );
      case 'hardware':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        );
      case 'roll':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        );
      case 'profile':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>HOME</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-indigo-600">INVENTORY MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>INVENTORY & STOCK</span>
            {branding.subscriptionTier === 'Pro' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                PRO ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                STANDARD
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time raw material tracking, extrusion yard allocation, and hardware stock management.
          </p>
        </div>

        {/* Action Buttons (Export, Adjustments, + Add Inventory Item) */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExportCSV}
            title="Download CSV Report"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Stock Report</span>
          </button>

          <button
            onClick={() => {
              setMovementSelectedId(null);
              setIsMovementModalOpen(true);
            }}
            title="Stock In / Out Movement"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span>Stock Adjustments</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* QC inspection quick banner if active */}
      {qcNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{qcNotice}</span>
          </div>
          <button
            onClick={() => setQcNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Extrusions & Bars */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                TOTAL EXTRUSIONS & BARS
              </span>
              <div className="text-2xl font-black text-slate-900">
                {totalExtrusionsLength.toLocaleString('en-IN')}{' '}
                <span className="text-sm font-semibold text-slate-500">m</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last delivery
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                LOW STOCK ALERTS
              </span>
              <div className="text-2xl font-black text-rose-600">
                {lowStockCount}{' '}
                <span className="text-sm font-semibold text-slate-500">
                  {lowStockCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3" />
                  Immediate reorder required
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Stock Valuation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                TOTAL STOCK VALUATION
              </span>
              <div className="text-2xl font-black text-slate-900">
                {formattedValuation}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">
                  Based on current PO rates
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Active Inward Material */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                ACTIVE INWARD MATERIAL
              </span>
              <div className="text-2xl font-black text-indigo-900">
                +850 <span className="text-sm font-semibold text-slate-500">KGs</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <Truck className="w-3 h-3" />
                  2 shipments arriving today
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Series Classification Filter Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Multi-Filter Dropdowns Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by profile code, name, rack location, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          {/* Brand Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Brands:</span>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {brandsList.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'All' ? 'All Brands' : brand}
                </option>
              ))}
            </select>
          </div>

          {/* Units Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Units:</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {unitsList.map((unit) => (
                <option key={unit} value={unit}>
                  {unit === 'All' ? 'All Units' : unit}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(brandFilter !== 'All' ||
            unitFilter !== 'All' ||
            statusFilter !== 'All' ||
            searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setBrandFilter('All');
                setUnitFilter('All');
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-secondary">
                <th className="p-4 w-10 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={
                      filteredInventory.length > 0 &&
                      selectedIds.length === filteredInventory.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[260px] align-middle">
                  Profile / Material Name
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[160px] align-middle">
                  Series Classification
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[160px] align-middle">
                  Brand / Supplier
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[160px] align-middle">
                  Rack Location
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[170px] align-middle">
                  Stock On Hand
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[120px] align-middle">
                  Unit Price
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[110px] align-middle">
                  Total Value
                </th>
                <th className="py-4 px-3 font-extrabold whitespace-nowrap min-w-[120px] align-middle">
                  Status
                </th>
                <th className="py-4 px-4 font-extrabold text-right whitespace-nowrap min-w-[160px] align-middle">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No inventory materials match your filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting the search criteria or click "+ Add Inventory Item" to catalog new stock.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isLow = item.status === 'Low Stock' || item.currentStock <= item.minStock;
                  const isOut = item.status === 'Out of Stock' || item.currentStock === 0;
                  const totalVal = item.currentStock * item.unitPrice;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="p-4 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Material Name & Subtitle */}
                      <td className="py-4 px-3 align-middle">
                        <div className="flex items-center gap-3">
                          {getItemIcon(item)}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs tracking-tight">
                              {item.name}
                            </div>
                            {item.specSubtitle && (
                              <div className="text-[11px] text-slate-500 font-secondary mt-0.5 leading-snug">
                                {item.specSubtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Series Classification */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap font-secondary">
                          {item.seriesClassification || item.category}
                        </span>
                      </td>

                      {/* Brand / Supplier */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs whitespace-nowrap font-secondary">
                          {item.brandName || 'Generic'}
                        </span>
                      </td>

                      {/* Rack Location */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        {item.rackLocation ? (
                          <span className="inline-block font-mono text-[11px] font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                            {item.rackLocation}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] whitespace-nowrap">Yard / Floor</span>
                        )}
                      </td>

                      {/* Stock On Hand & Bar */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-xs flex items-baseline gap-1 whitespace-nowrap">
                            <span>{item.currentStock.toLocaleString('en-IN')}</span>
                            <span className="font-semibold text-slate-500 text-[11px] font-secondary">{item.unit}</span>
                          </div>
                          {item.secondaryStockDetail && (
                            <div className="text-[11px] text-slate-400 font-secondary whitespace-nowrap">
                              {item.secondaryStockDetail}
                            </div>
                          )}
                          {/* Mini visual stock bar */}
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOut
                                  ? 'bg-rose-500'
                                  : isLow
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((item.currentStock / (item.minStock * 2.5 || 100)) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        <div className="flex items-baseline gap-1 whitespace-nowrap font-secondary">
                          <span className="font-bold text-slate-900 text-xs">₹{item.unitPrice.toLocaleString('en-IN')}</span>
                          <span className="text-slate-500 text-[11px] font-secondary">/ {item.unit}</span>
                        </div>
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap font-extrabold text-slate-900 text-xs font-mono">
                        ₹{totalVal.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap font-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap font-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap font-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* Stock In/Out button */}
                          <button
                            onClick={() => {
                              setMovementSelectedId(item.id);
                              setIsMovementModalOpen(true);
                            }}
                            title="Stock In / Out"
                            className="px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap font-secondary"
                          >
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                            <span>Stock In/Out</span>
                          </button>

                          {/* Quick Reorder button if Low */}
                          {isLow && (
                            <button
                              onClick={() => {
                                setReorderSelectedItem(item);
                                setIsReorderModalOpen(true);
                              }}
                              title="Quick Reorder Stock"
                              className="px-2.5 py-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap font-secondary"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>Reorder</span>
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditSelectedItem(item);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit specs & pricing"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer with item count and pagination preview */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong className="text-slate-800">{filteredInventory.length}</strong> of{' '}
            <strong className="text-slate-800">{inventory.length}</strong> total inventory items
          </div>
          <div className="flex items-center gap-2">
            <span>Valuation of Filtered Stock:</span>
            <strong className="text-slate-900 font-extrabold">
              ₹
              {filteredInventory
                .reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0)
                .toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Bottom 3 Warehouse Operations & Intelligence Cards (from Stitch screen d7e93c4b93f645b58413c11e2d2a586a) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* Card 1: Extrusion Yard Density */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                EXTRUSION YARD DENSITY
              </span>
              <Warehouse className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-4 flex items-center gap-4">
              {/* Circular percentage visual */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 transition-all duration-1000"
                    strokeDasharray="78, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-black text-slate-900 text-sm">78%</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-black text-slate-900">78% Storage Capacity</div>
                <p className="text-[11px] text-slate-500">
                  Bay A: 84% Occupied | Bay B: 72% Occupied
                </p>
                <p className="text-[11px] text-emerald-600 font-bold">22% Safety free space available</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              alert('Yard layout optimized. Free slots generated in Bay B racks for incoming shipment.');
            }}
            className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-center"
          >
            Optimize Rack Allocation
          </button>
        </div>

        {/* Card 2: Incoming Quality Check */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                INCOMING QUALITY CHECK
              </span>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-full">
                QC Pending (2 Lots)
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>LOT-8821: VEKA 60mm Profiles</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Wall Caliper Check
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  50 Bars awaiting outer wall thickness verification
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>LOT-8819: Saint-Gobain Toughened</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Passed (99.8%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  12 Crates cleared optical distortion & edge grind QC
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setQcNotice('All incoming shipments (LOT-8821 & LOT-8819) verified & approved for fabrication release.');
            }}
            className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
          >
            Open QC Inspection Console
          </button>
        </div>

        {/* Card 3: Fabrication Cut-List Usage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                FABRICATION CUT-LIST USAGE
              </span>
              <Scissors className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">98.4%</span>
                <span className="text-xs font-semibold text-slate-500">Material Yield</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.4%' }} />
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div className="flex justify-between">
                  <span>Total Profile Processed:</span>
                  <strong className="text-slate-700">3,420 m</strong>
                </div>
                <div className="flex justify-between">
                  <span>Usable Offcuts in Remnant Bin:</span>
                  <strong className="text-indigo-600">42 m</strong>
                </div>
                <div className="flex justify-between">
                  <span>Scrap Rate:</span>
                  <strong className="text-emerald-600">&lt; 1.6% (Optimal)</strong>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              alert('Displaying 6 usable remnant offcuts (> 1.2m) available in Remnant Rack for job nesting.');
            }}
            className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
          >
            View Offcut Bin & Remnants
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementSelectedId(null);
        }}
        selectedItemId={movementSelectedId}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditSelectedItem(null);
        }}
        item={editSelectedItem}
      />

      <QuickReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => {
          setIsReorderModalOpen(false);
          setReorderSelectedItem(null);
        }}
        item={reorderSelectedItem}
      />

      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        featureName="Enterprise Inventory & Multi-Warehouse Tracking"
      />
    </div>
  );
}
