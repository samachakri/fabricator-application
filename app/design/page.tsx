'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  AlertCircle,
  Search,
  ChevronDown,
  Play,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Laptop,
  Smartphone,
  Info,
  X,
  Lock,
} from 'lucide-react';

interface DesignQueueItem {
  id: string; // e.g. "ORD-1084"
  projectId: string;
  customerName: string;
  projectSubtitle: string;
  scopeTitle: string;
  seriesSubtitle: string;
  profileSystem: 'Kommerling' | 'Schüco' | 'Prominance' | 'VEKA' | 'Aluplast';
  assignedDrafter: {
    name: string;
    initials: string;
    avatarColor?: string;
  };
  isHighPriority: boolean;
  actionType: 'start' | 'continue';
  iconType: 'compass' | 'play';
}

// Logged-in authenticated user (Pro Version: 1 credential = 1 person with 2 devices limit)
const LOGGED_IN_DRAFTER = {
  name: 'Chakradhar',
  initials: 'CR',
  avatarColor: 'bg-blue-100 text-[#0A2E8A] border-blue-200',
};

const INITIAL_QUEUE_DATA: DesignQueueItem[] = [
  {
    id: 'ORD-1084',
    projectId: 'PRJ-1042',
    customerName: 'Vikramaditya Rao',
    projectSubtitle: 'Palm Meadows, Villa 42',
    scopeTitle: '3-Track Sliding (W01-W04)',
    seriesSubtitle: 'Kommerling 88BS',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1085',
    projectId: 'PRJ-1042',
    customerName: 'Anand Heights Penthouse',
    projectSubtitle: 'Tower B, Flat 1401',
    scopeTitle: '8-Panel Bi-Fold (FD-01)',
    seriesSubtitle: 'Schüco ASS 70.FD',
    profileSystem: 'Schüco',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: true,
    actionType: 'continue',
    iconType: 'play',
  },
  {
    id: 'ORD-1086',
    projectId: 'PRJ-1042',
    customerName: 'Mayflower Enclave',
    projectSubtitle: 'Unit 304, HSR Layout',
    scopeTitle: 'Arched Casement (W-02)',
    seriesSubtitle: 'Prominance Optima',
    profileSystem: 'Prominance',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1087',
    projectId: 'PRJ-1042',
    customerName: 'Oakridge Tower 2B',
    projectSubtitle: 'Developer Package',
    scopeTitle: '2-Track Sliding + Mesh (12 Units)',
    seriesSubtitle: 'VEKA Softline',
    profileSystem: 'VEKA',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: true,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1088',
    projectId: 'PRJ-1042',
    customerName: 'Brigade Gateway 4C',
    projectSubtitle: 'Rajiv Chandran',
    scopeTitle: 'French Doors & Fixed Louver',
    seriesSubtitle: 'Kommerling',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'play',
  },
  {
    id: 'ORD-1089',
    projectId: 'PRJ-1042',
    customerName: 'Sobha Dream Acres',
    projectSubtitle: 'Wing C, Flat 802',
    scopeTitle: '3-Track Sliding with Bug Mesh',
    seriesSubtitle: 'VEKA Softline 70',
    profileSystem: 'VEKA',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1090',
    projectId: 'PRJ-1042',
    customerName: 'Prestige Lakeside Habitat',
    projectSubtitle: 'Tower 5, Unit 1204',
    scopeTitle: 'Casement with Fixed Top Light',
    seriesSubtitle: 'Prominance Optima 60',
    profileSystem: 'Prominance',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1091',
    projectId: 'PRJ-1042',
    customerName: 'Godrej Woodsman Estate',
    projectSubtitle: 'Tower 2, Flat 1801',
    scopeTitle: 'Corner Window 90-Deg Joint',
    seriesSubtitle: 'Kommerling 76AD',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'continue',
    iconType: 'play',
  },
  {
    id: 'ORD-1092',
    projectId: 'PRJ-1042',
    customerName: 'Adarsh Palm Retreat',
    projectSubtitle: 'Villa 108, Phase 2',
    scopeTitle: 'Heavy Duty Slide & Fold (6-Panel)',
    seriesSubtitle: 'Schüco ASS 80.FD',
    profileSystem: 'Schüco',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: true,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1093',
    projectId: 'PRJ-1042',
    customerName: 'Embassy Boulevard',
    projectSubtitle: 'Villa 24, Yelahanka',
    scopeTitle: 'Tilt & Turn Villa Package (W05-W12)',
    seriesSubtitle: 'Kommerling 88 Plus',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1094',
    projectId: 'PRJ-1042',
    customerName: 'Total Environment Windmills',
    projectSubtitle: 'Tower 3, Penthouse 16B',
    scopeTitle: 'Motorized Lift & Slide System',
    seriesSubtitle: 'Schüco ASE 60',
    profileSystem: 'Schüco',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1095',
    projectId: 'PRJ-1042',
    customerName: 'Purva Skywood',
    projectSubtitle: 'Tower 4, Unit 602',
    scopeTitle: 'Standard 2.5 Track Sliding',
    seriesSubtitle: 'Prominance Optima',
    profileSystem: 'Prominance',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'continue',
    iconType: 'play',
  },
  {
    id: 'ORD-1096',
    projectId: 'PRJ-1042',
    customerName: 'Phoenix One Bangalore West',
    projectSubtitle: 'Tower 7, Apt 1902',
    scopeTitle: 'Acoustic DGU Casement Windows',
    seriesSubtitle: 'VEKA Softline 82',
    profileSystem: 'VEKA',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1097',
    projectId: 'PRJ-1042',
    customerName: 'Salarpuria Sattva Greenage',
    projectSubtitle: 'Tower O, Flat 1104',
    scopeTitle: 'French Balcony Doors with Top Louver',
    seriesSubtitle: 'Kommerling 70',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1098',
    projectId: 'PRJ-1042',
    customerName: 'Divyasree 77 East',
    projectSubtitle: 'Villa 14, Marathahalli',
    scopeTitle: 'Panoramic Glass Curtain Wall & Slider',
    seriesSubtitle: 'Schüco ASS 70',
    profileSystem: 'Schüco',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1099',
    projectId: 'PRJ-1042',
    customerName: 'Bhartiya City Nikoo Homes',
    projectSubtitle: 'Tower 2, Flat 1403',
    scopeTitle: 'Casement with Mosquito Mesh (5 Units)',
    seriesSubtitle: 'Prominance Optima',
    profileSystem: 'Prominance',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'continue',
    iconType: 'play',
  },
  {
    id: 'ORD-1100',
    projectId: 'PRJ-1042',
    customerName: 'Mantri Espana',
    projectSubtitle: 'Block A, Penthouse 03',
    scopeTitle: 'Spanish Style Arched Casement',
    seriesSubtitle: 'VEKA Softline',
    profileSystem: 'VEKA',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1101',
    projectId: 'PRJ-1042',
    customerName: 'Rohan Viti',
    projectSubtitle: 'Row House 08',
    scopeTitle: 'Sliding Sash Kitchen Windows',
    seriesSubtitle: 'Kommerling',
    profileSystem: 'Kommerling',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
  {
    id: 'ORD-1102',
    projectId: 'PRJ-1042',
    customerName: 'Assetz Marq 3.0',
    projectSubtitle: 'Tower 1, Flat 804',
    scopeTitle: 'Master Bedroom Bay Window Design',
    seriesSubtitle: 'Prominance Optima',
    profileSystem: 'Prominance',
    assignedDrafter: LOGGED_IN_DRAFTER,
    isHighPriority: false,
    actionType: 'start',
    iconType: 'compass',
  },
];

export default function DesignStudioPage() {
  const router = useRouter();
  const [queue] = useState<DesignQueueItem[]>(INITIAL_QUEUE_DATA);
  const [activeTab, setActiveTab] = useState<'all' | 'priority'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // License Details Modal State
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  // Metric counts
  const awaitingCount = queue.length; // 19
  const highPriorityCount = queue.filter((item) => item.isHighPriority).length; // 3

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      // Tab filter
      if (activeTab === 'priority' && !item.isHighPriority) return false;

      // Profile System filter
      if (selectedSystem !== 'All' && item.profileSystem !== selectedSystem) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchCust = item.customerName.toLowerCase().includes(q);
        const matchSub = item.projectSubtitle.toLowerCase().includes(q);
        const matchScope = item.scopeTitle.toLowerCase().includes(q);
        const matchSeries = item.seriesSubtitle.toLowerCase().includes(q);
        if (!matchId && !matchCust && !matchSub && !matchScope && !matchSeries) {
          return false;
        }
      }

      return true;
    });
  }, [queue, activeTab, selectedSystem, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredQueue.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQueue.slice(startIndex, startIndex + pageSize);
  }, [filteredQueue, currentPage, pageSize]);

  // Launch Window Designer
  const handleLaunchDesigner = (item: DesignQueueItem) => {
    router.push(`/projects/${item.projectId}/design/W01`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb matching Screenshot */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2 select-none">
          <span className="text-slate-400">FabricatorPro</span>
          <span className="text-slate-300">&gt;</span>
          <span className="text-slate-800 font-semibold">Design Studio</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Design Studio</h1>
          {/* Pro License Indicator Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLicenseModalOpen(true)}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2 shadow-2xs transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#0A2E8A]">Pro License:</span>
              <span>1 Person (2 Devices Limit)</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2 Top Metric Cards matching Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Awaiting Designs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              AWAITING DESIGNS
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {awaitingCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-secondary">
                orders in queue
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: High Priority */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              HIGH PRIORITY
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-rose-600 tracking-tight">
                {highPriorityCount < 10 ? `0${highPriorityCount}` : highPriorityCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-secondary">
                urgent takeoff
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pro Version 1 Person & 2 Devices License Notice Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-sm">
                Pro Version License Active
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0A2E8A] border border-blue-200">
                1 Credential = 1 Person Only
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                2 Devices Limit
              </span>
            </div>
            <p className="text-slate-600 font-secondary mt-1">
              Logged-in credential belongs exclusively to <strong>Chakradhar (Admin)</strong>. All orders in the queue are <strong>automatically generated & assigned</strong> to your account with a maximum limit of 2 active devices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            onClick={() => setIsLicenseModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active: Device 1 of 2</span>
            <Info className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tabs: All Pending (19) vs High Priority (3) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Pending</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {queue.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('priority');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'priority'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>High Priority</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'priority'
                  ? 'bg-rose-500 text-white'
                  : 'text-rose-600 bg-rose-50'
              }`}
            >
              {highPriorityCount}
            </span>
          </button>
        </div>

        {/* Right Search and Profile System Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter queue orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-56 pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSystem}
              onChange={(e) => {
                setSelectedSystem(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-white rounded-lg border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              <option value="All">All Profile Systems</option>
              <option value="Kommerling">Kommerling</option>
              <option value="Schüco">Schüco</option>
              <option value="Prominance">Prominance</option>
              <option value="VEKA">VEKA</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Queue Table matching Stitch Screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="py-3.5 px-6 font-extrabold">ORDER / LEAD</th>
                <th className="py-3.5 px-6 font-extrabold">CUSTOMER & PROJECT</th>
                <th className="py-3.5 px-6 font-extrabold">WINDOW SCOPE & SERIES</th>
                <th className="py-3.5 px-6 font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <span>ASSIGNED DRAFTER</span>
                    <span
                      title="Pro Version: 1 credential is limited to 1 person with 2 devices limit. Designs are automatically assigned to logged-in user Chakradhar."
                      className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full tracking-normal normal-case select-none"
                    >
                      Auto-Generated • 2 Dev Limit
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-6 font-extrabold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Order ID */}
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap text-xs">
                      {item.id}
                    </td>

                    {/* Customer & Project */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-xs leading-tight">
                        {item.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-secondary mt-0.5">
                        {item.projectSubtitle}
                      </div>
                    </td>

                    {/* Window Scope & Series */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 text-xs leading-tight">
                        {item.scopeTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 font-secondary mt-0.5">
                        {item.seriesSubtitle}
                      </div>
                    </td>

                    {/* Assigned Drafter: Automatically generated for logged-in user in Pro Version */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0A2E8A] border border-blue-200 font-bold text-[11px] flex items-center justify-center font-secondary shrink-0">
                          CR
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">Chakradhar</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-blue-100 text-[#0A2E8A] rounded">
                              You
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-secondary mt-0.5">
                            Auto-assigned • Pro (2 Dev Limit)
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleLaunchDesigner(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0A2540] hover:bg-[#06182B] active:bg-[#04101D] shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {item.iconType === 'play' ? (
                          <Play className="w-3 h-3 fill-current" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {item.actionType === 'continue' ? 'Continue Design' : 'Start Design'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Screenshot */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 select-none">
          <div>
            Showing <strong className="text-slate-800">{paginatedItems.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredQueue.length}</strong> queue orders
          </div>

          {/* Pagination buttons: Previous, 1, 2, 3, Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium text-xs transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-md font-bold text-xs transition-all flex items-center justify-center ${
                  currentPage === pageNum
                    ? 'bg-[#0A2540] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent font-medium text-xs transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Pro Version License & 2-Device Limit Details Modal */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pro Version License</h3>
                  <p className="text-[11px] text-slate-500 font-secondary">
                    Single-User Credential Policy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Authenticated Account Details */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-900 font-bold">Licensed User</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900">
                    Chakradhar (Admin)
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  In this Pro Version, each credential is tied strictly to <strong>1 person</strong>. All queue design takeoffs and CAD tasks are <strong>automatically assigned</strong> to your credential.
                </p>
              </div>

              {/* 2-Device Limit Allocation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Device Limit Status (2 Max Allowed)
                </h4>
                <div className="space-y-2">
                  {/* Device 1 (Current) */}
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Laptop className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Workstation (Current)</p>
                        <p className="text-[10px] text-slate-500 font-secondary">
                          Windows PC • Active Now
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </span>
                  </div>

                  {/* Device 2 (Available) */}
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Secondary Device</p>
                        <p className="text-[10px] text-slate-400 font-secondary">
                          Available for Tablet / Shop Floor Phone
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      1 Slot Open
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Policy Reminder:</strong> Credential sharing beyond 1 person and more than 2 concurrent device sessions is restricted by Pro licensing security.
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsLicenseModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0A2540] hover:bg-[#06182B] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
