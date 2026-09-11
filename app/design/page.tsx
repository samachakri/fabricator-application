'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { WindowDesign, Project, WindowType, ProfileBrand } from '@/lib/types';
import {
  Compass,
  AlertCircle,
  Search,
  ChevronDown,
  Play,
  Layers,
  Plus,
  Copy,
  FileText,
  CheckCircle2,
  X,
  Building2,
  SlidersHorizontal,
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
];

export default function DesignStudioPage() {
  const router = useRouter();
  const { projects, addWindow, duplicateWindow } = useStore();

  const [queue] = useState<DesignQueueItem[]>(INITIAL_QUEUE_DATA);
  const [activeTab, setActiveTab] = useState<'designed' | 'queue' | 'priority'>('designed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modal State for "+ Design New Window"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWindowProjectId, setNewWindowProjectId] = useState(projects[0]?.id || 'PRJ-1042');
  const [newWindowType, setNewWindowType] = useState<WindowType>('sliding_2track');
  const [newWindowName, setNewWindowName] = useState('2 Track Sliding');
  const [newWindowWidth, setNewWindowWidth] = useState(1500);
  const [newWindowHeight, setNewWindowHeight] = useState(1200);
  const [newWindowBrand, setNewWindowBrand] = useState<ProfileBrand>('VEKA');

  // Dynamically aggregate all designed windows so far across all projects
  const allDesignedWindows = useMemo(() => {
    const list: Array<{
      window: WindowDesign;
      project: Project;
    }> = [];

    projects.forEach((proj) => {
      (proj.windows || []).forEach((win) => {
        list.push({
          window: win,
          project: proj,
        });
      });
    });

    return list;
  }, [projects]);

  // Metric counts
  const totalDesignedCount = allDesignedWindows.length;
  const awaitingCount = queue.length;
  const highPriorityCount = queue.filter((item) => item.isHighPriority).length;

  // Filtered Designed Windows
  const filteredDesignedWindows = useMemo(() => {
    return allDesignedWindows.filter((item) => {
      // Profile System filter
      if (selectedSystem !== 'All' && item.window.profileBrand !== selectedSystem) {
        return false;
      }

      // Project Type filter
      if (selectedProjectType !== 'All' && item.project.projectType !== selectedProjectType) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWinId = item.window.id.toLowerCase().includes(q);
        const matchWinName = item.window.name.toLowerCase().includes(q);
        const matchProjName = item.project.name.toLowerCase().includes(q);
        const matchProjId = item.project.id.toLowerCase().includes(q);
        const matchCust = item.project.customer?.name?.toLowerCase().includes(q) || false;
        const matchLoc = item.project.location?.toLowerCase().includes(q) || false;
        const matchBrand = item.window.profileBrand.toLowerCase().includes(q);

        if (!matchWinId && !matchWinName && !matchProjName && !matchProjId && !matchCust && !matchLoc && !matchBrand) {
          return false;
        }
      }

      return true;
    });
  }, [allDesignedWindows, selectedSystem, selectedProjectType, searchQuery]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (activeTab === 'priority' && !item.isHighPriority) return false;
      if (selectedSystem !== 'All' && item.profileSystem !== selectedSystem) return false;

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

  // Pagination for Active View
  const isDesignedView = activeTab === 'designed';
  const totalItemsCount = isDesignedView ? filteredDesignedWindows.length : filteredQueue.length;
  const totalPages = Math.ceil(totalItemsCount / pageSize) || 1;

  const paginatedDesigned = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDesignedWindows.slice(startIndex, startIndex + pageSize);
  }, [filteredDesignedWindows, currentPage, pageSize]);

  const paginatedQueue = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQueue.slice(startIndex, startIndex + pageSize);
  }, [filteredQueue, currentPage, pageSize]);

  // Handlers
  const handleLaunchDesigner = (projectId: string, windowId: string = 'W01') => {
    router.push(`/projects/${projectId}/design/${windowId}`);
  };

  const handleDuplicateWindow = (projectId: string, windowId: string) => {
    const duplicated = duplicateWindow(projectId, windowId);
    if (duplicated) {
      // Duplication increases total designed count immediately!
    }
  };

  const handleCreateNewWindow = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addWindow(newWindowProjectId, {
      name: newWindowName,
      type: newWindowType,
      width: Number(newWindowWidth),
      height: Number(newWindowHeight),
      profileBrand: newWindowBrand,
      profileSeries: `${newWindowBrand} 84BS`,
      tracks: newWindowType === 'sliding_3track' ? 3 : newWindowType === 'sliding_2track' ? 2 : 1,
      sashes: newWindowType === 'sliding_3track' ? 3 : newWindowType === 'casement_double' ? 2 : 1,
      profileColor: 'pure_white',
      glassType: 'clear_5mm',
      status: 'DESIGNED',
    });

    setIsAddModalOpen(false);
    if (created) {
      // Instantly routes into CAD designer, count increments in store
      router.push(`/projects/${newWindowProjectId}/design/${created.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1.5 select-none">
            <span className="text-slate-400">FabricatorPro</span>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-800 font-semibold">Design Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A2E8A] text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Instant Window Design Studio
            </h1>
          </div>
        </div>

        {/* Primary "+ Design New Window" Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A2E8A] hover:bg-[#08256E] active:bg-[#061C52] text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Design New Window</span>
        </button>
      </div>

      {/* Top Metric Cards: Container Count for Total Designs (increases dynamically) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: TOTAL DESIGNS CONTAINER COUNT (Requested: increases dynamically as windows are added or designed) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between group hover:border-[#0A2E8A]/30 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                TOTAL DESIGNS
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                Live Sync
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {totalDesignedCount < 10 ? `0${totalDesignedCount}` : totalDesignedCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                windows designed so far
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Increases with every added or designed window</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Awaiting Designs Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between group hover:border-blue-200 transition-all">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              AWAITING TAKEOFF
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {awaitingCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                orders in queue
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1.5">
              Pending CAD takeoffs & site surveys
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: High Priority Takeoff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden flex items-start justify-between group hover:border-rose-200 transition-all">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              HIGH PRIORITY
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl font-black text-rose-600 tracking-tight font-mono">
                {highPriorityCount < 10 ? `0${highPriorityCount}` : highPriorityCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                urgent takeoff
              </span>
            </div>
            <div className="text-[11px] text-rose-500/80 font-medium mt-1.5">
              Immediate design approval required
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Designed Windows Tab vs Queue Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Designed Windows So Far */}
          <button
            onClick={() => {
              setActiveTab('designed');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'designed'
                ? 'bg-[#0A2E8A] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Designed Windows So Far</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'designed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {totalDesignedCount}
            </span>
          </button>

          {/* Tab 2: All Pending Queue */}
          <button
            onClick={() => {
              setActiveTab('queue');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Awaiting Orders</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === 'queue' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {queue.length}
            </span>
          </button>

          {/* Tab 3: High Priority */}
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

        {/* Right Search, System & Project Type Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isDesignedView ? 'Search designed windows...' : 'Filter queue orders...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-56 pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Project Type Filter (For Designed Windows) */}
          {isDesignedView && (
            <div className="relative">
              <select
                value={selectedProjectType}
                onChange={(e) => {
                  setSelectedProjectType(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-white rounded-lg border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] cursor-pointer"
              >
                <option value="All">All Project Types</option>
                <option value="Residential">Residential</option>
                <option value="Builder / Apartment">Builder / Apartment</option>
                <option value="Villa">Villa / Luxury</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Profile System Dropdown */}
          <div className="relative">
            <select
              value={selectedSystem}
              onChange={(e) => {
                setSelectedSystem(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs bg-white rounded-lg border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] cursor-pointer"
            >
              <option value="All">All Profile Brands</option>
              <option value="VEKA">VEKA</option>
              <option value="Kommerling">Kommerling</option>
              <option value="Schüco">Schüco</option>
              <option value="Prominance">Prominance</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {isDesignedView ? (
        /* 1. Designed Windows So Far Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5 font-extrabold">WINDOW CODE & TYPE</th>
                  <th className="py-3.5 px-5 font-extrabold">PROJECT DETAILS</th>
                  <th className="py-3.5 px-5 font-extrabold">DIMENSIONS (W × H)</th>
                  <th className="py-3.5 px-5 font-extrabold">GLAZING & COLOR</th>
                  <th className="py-3.5 px-5 font-extrabold">ASSIGNED DRAFTER</th>
                  <th className="py-3.5 px-5 font-extrabold">STATUS</th>
                  <th className="py-3.5 px-5 font-extrabold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedDesigned.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-slate-500 text-xs">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700">No designed windows found</p>
                      <p className="text-slate-400 mt-0.5">Click &ldquo;+ Design New Window&rdquo; above to start designing.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedDesigned.map((item, idx) => (
                    <tr key={`${item.project.id}-${item.window.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Window Code & Type */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-[#0A2E8A] text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md shrink-0 shadow-2xs">
                            {item.window.id}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-xs leading-tight group-hover:text-[#0A2E8A] transition-colors">
                              {item.window.name}
                            </div>
                            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                              {item.window.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Project Details */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                          {item.project.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.project.customer?.name} • {item.project.location || 'Site Survey'}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {item.project.projectType || 'Residential'}
                        </span>
                      </td>

                      {/* Dimensions (W x H) */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 text-xs">
                          {item.window.width} × {item.window.height} mm
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Area: {((item.window.width * item.window.height) / 1000000).toFixed(2)} m²
                        </div>
                      </td>

                      {/* Glazing & Color */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 text-xs capitalize">
                          {item.window.profileBrand} • {(item.window.profileColor || 'pure_white').replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 capitalize">
                          {(item.window.glassType || 'clear_5mm').replace('_', ' ')}
                        </div>
                      </td>

                      {/* Assigned Drafter */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[10px] flex items-center justify-center font-mono">
                            {LOGGED_IN_DRAFTER.initials}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {LOGGED_IN_DRAFTER.name}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>DESIGNED</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open in CAD */}
                          <button
                            onClick={() => handleLaunchDesigner(item.project.id, item.window.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0A2E8A] hover:bg-[#08256E] shadow-2xs transition-all"
                            title="Open 2D CAD Canvas"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>CAD Studio</span>
                          </button>

                          {/* Duplicate (Increases count immediately) */}
                          <button
                            onClick={() => handleDuplicateWindow(item.project.id, item.window.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0A2E8A] hover:bg-slate-100 border border-slate-200 transition-colors"
                            title="Duplicate Window (increases total count)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Quotation */}
                          <button
                            onClick={() => router.push(`/projects/${item.project.id}/quotation`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                            title="View Project Quotation"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 select-none">
            <div>
              Showing <strong className="text-slate-800">{paginatedDesigned.length}</strong> of{' '}
              <strong className="text-slate-800">{filteredDesignedWindows.length}</strong> designed windows so far
            </div>

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
                      ? 'bg-[#0A2E8A] text-white shadow-2xs'
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
      ) : (
        /* 2. Orders Queue Table (Awaiting / High Priority) */
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
                {paginatedQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      No orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap text-xs">
                        {item.id}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-secondary mt-0.5">
                          {item.projectSubtitle}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 text-xs leading-tight">
                          {item.scopeTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-secondary mt-0.5">
                          {item.seriesSubtitle}
                        </div>
                      </td>

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

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleLaunchDesigner(item.projectId, 'W01')}
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

          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 select-none">
            <div>
              Showing <strong className="text-slate-800">{paginatedQueue.length}</strong> of{' '}
              <strong className="text-slate-800">{filteredQueue.length}</strong> queue orders
            </div>

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
      )}

      {/* Modal: "+ Design New Window" */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0A2E8A] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Design New Window</h3>
                  <p className="text-[11px] text-slate-500">Adds window to project and increases total design count</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewWindow} className="p-6 space-y-4">
              {/* Select Project */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Project
                </label>
                <select
                  value={newWindowProjectId}
                  onChange={(e) => setNewWindowProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) • {p.projectType || 'Residential'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Window Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Window Identifier / Name
                </label>
                <input
                  type="text"
                  required
                  value={newWindowName}
                  onChange={(e) => setNewWindowName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
                  placeholder="e.g. Living Room 3-Track Slider"
                />
              </div>

              {/* Window Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Typology
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sliding_2track' as WindowType, label: '2 Track Sliding' },
                    { id: 'sliding_3track' as WindowType, label: '3 Track Sliding' },
                    { id: 'casement_single' as WindowType, label: 'Single Casement' },
                    { id: 'casement_double' as WindowType, label: 'Double Casement' },
                    { id: 'tilt_and_turn' as WindowType, label: 'Tilt & Turn' },
                    { id: 'fixed' as WindowType, label: 'Fixed Frame' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setNewWindowType(t.id);
                        setNewWindowName(t.label);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        newWindowType === t.id
                          ? 'border-[#0A2E8A] bg-blue-50/50 text-[#0A2E8A]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Width (mm)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="5000"
                    value={newWindowWidth}
                    onChange={(e) => setNewWindowWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Height (mm)
                  </label>
                  <input
                    type="number"
                    min="300"
                    max="4000"
                    value={newWindowHeight}
                    onChange={(e) => setNewWindowHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
                  />
                </div>
              </div>

              {/* Profile Brand */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Profile Brand
                </label>
                <select
                  value={newWindowBrand}
                  onChange={(e) => setNewWindowBrand(e.target.value as ProfileBrand)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
                >
                  <option value="VEKA">VEKA Systems India</option>
                  <option value="Kommerling">Kommerling Profiline</option>
                  <option value="Prominance">Prominance Optima</option>
                  <option value="Schüco">Schüco Systems</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A2E8A] hover:bg-[#08256E] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Create & Launch CAD Studio &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
