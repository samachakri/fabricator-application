'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  AlertCircle,
  Search,
  ChevronDown,
  Play,
  Layers,
} from 'lucide-react';
import { useStore } from '@/lib/store';

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

// Drafter automatically assigned for logged-in user
const LOGGED_IN_DRAFTER = {
  name: 'Chakradhar',
  initials: 'CR',
  avatarColor: 'bg-slate-100 text-slate-700 border-slate-300',
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
  const { projects } = useStore();
  const [queue] = useState<DesignQueueItem[]>(INITIAL_QUEUE_DATA);
  const [activeTab, setActiveTab] = useState<'all-designs' | 'all' | 'priority'>('all-designs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Metric counts
  const designedWindowsCount = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.windows?.length || 0), 0);
  }, [projects]);
  const allDesignsCount = queue.length + designedWindowsCount;
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Design Studio</h1>
      </div>

      {/* Top Metric Cards matching Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: ALL DESIGNS (Newly added container as requested) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              ALL DESIGNS
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {allDesignsCount}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-secondary">
                total designs
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Awaiting Designs */}
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

        {/* Card 3: High Priority */}
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

      {/* Filter Toolbar matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tabs: All Designs vs All Pending (19) vs High Priority (3) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('all-designs');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all-designs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All Designs</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'all-designs' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allDesignsCount}
            </span>
          </button>

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
                <th className="py-3.5 px-6 font-extrabold">ASSIGNED DRAFTER</th>
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

                    {/* Assigned Drafter: Automatically generated for logged-in user Chakradhar */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] flex items-center justify-center font-secondary">
                          {item.assignedDrafter.initials}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.assignedDrafter.name}
                        </span>
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
    </div>
  );
}
