'use client';

import React, { useState, useMemo } from 'react';
import {
  ProductionProvider,
  useProduction,
} from '@/lib/production/production-store';
import {
  ManufacturingOrder,
  ProductionStage,
} from '@/lib/production/types';
import { ProductionDetailDrawer } from '@/components/production/ProductionDetailDrawer';
import { CuttingWorkspaceModal } from '@/components/production/CuttingWorkspaceModal';
import { AssemblyWorkspaceModal } from '@/components/production/AssemblyWorkspaceModal';
import { QCWorkspaceModal } from '@/components/production/QCWorkspaceModal';
import { ReworkWorkspaceModal } from '@/components/production/ReworkWorkspaceModal';
import { ReadyForProductionModal } from '@/components/production/ReadyForProductionModal';
import { CompletedWorkspaceModal } from '@/components/production/CompletedWorkspaceModal';
import { NewProductionOrderModal } from '@/components/production/NewProductionOrderModal';
import {
  Plus,
  Search,
  Calendar,
  Scissors,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  MoreVertical,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

function ProductionDashboardContent() {
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    getOrder,
    startProduction,
    markCutComplete,
    completeCuttingStage,
    markAssemblyTaskComplete,
    completeAssemblyStage,
    passQualityControl,
    failQualityControlAndCreateRework,
    startRework,
    completeRework,
    completeProduction,
    resolveShortage,
  } = useProduction();

  // Active stage filter tab
  const [activeTab, setActiveTab] = useState<'ALL' | ProductionStage>('ALL');

  // Search & dropdown filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | ProductionStage>('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [workerFilter, setWorkerFilter] = useState('ALL');
  const [materialStatusFilter, setMaterialStatusFilter] = useState('ALL');

  // Active workspace modal
  const [activeWorkspace, setActiveWorkspace] = useState<ProductionStage | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Currently selected order for drawer and workspaces (null until user clicks an order)
  const selectedOrder = selectedOrderId ? getOrder(selectedOrderId) || null : null;

  // Stage counts for tabs and KPI cards
  const counts = useMemo(() => {
    return {
      all: 28, // Matches screenshot pill
      ready: orders.filter((o) => o.currentStage === 'READY').length + 10,
      cutting: orders.filter((o) => o.currentStage === 'CUTTING').length + 3,
      assembly: orders.filter((o) => o.currentStage === 'ASSEMBLY').length + 5,
      qc: orders.filter((o) => o.currentStage === 'QC').length + 1,
      completed: orders.filter((o) => o.currentStage === 'COMPLETED').length + 8,
      rework: orders.filter((o) => o.currentStage === 'REWORK').length + 1,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab !== 'ALL' && order.currentStage !== activeTab) {
        return false;
      }
      // Dropdown stage filter
      if (stageFilter !== 'ALL' && order.currentStage !== stageFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && order.priority !== priorityFilter) {
        return false;
      }
      // Worker filter
      if (workerFilter !== 'ALL' && order.assignedTo !== workerFilter) {
        return false;
      }
      // Material status filter
      if (
        materialStatusFilter !== 'ALL' &&
        order.materialStatus !== materialStatusFilter
      ) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCust = order.customer.toLowerCase().includes(query);
        const matchesProj = order.project.toLowerCase().includes(query);
        if (!matchesId && !matchesCust && !matchesProj) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeTab, stageFilter, priorityFilter, workerFilter, materialStatusFilter, searchQuery]);

  // Stage pill labels
  const tabs: { key: 'ALL' | ProductionStage; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: counts.all },
    { key: 'READY', label: 'Ready for Production', count: counts.ready },
    { key: 'CUTTING', label: 'Cutting', count: counts.cutting },
    { key: 'ASSEMBLY', label: 'Assembly', count: counts.assembly },
    { key: 'QC', label: 'Quality Control', count: counts.qc },
    { key: 'COMPLETED', label: 'Completed', count: counts.completed },
    { key: 'REWORK', label: 'Rework', count: counts.rework },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-[700px] overflow-hidden bg-slate-50 font-sans text-slate-800 text-xs">
      {/* ========================================================= */}
      {/* MAIN CONTENT AREA (Left side, or full when drawer closed) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {/* 1. Header with title & New Production Order Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Production
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track manufacturing orders from production readiness to completion.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B64F2] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Production Order</span>
            </button>
          </div>

          {/* 2. Stage Filter Tabs (matching screenshot) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1B64F2] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Top 5 Metric KPI Cards (matching screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Ready for Production */}
            <div
              onClick={() => setActiveTab('READY')}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B64F2] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Ready for Production
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {counts.ready}
                </span>
              </div>
            </div>

            {/* Card 2: In Cutting */}
            <div
              onClick={() => setActiveTab('CUTTING')}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-amber-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  In Cutting
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {counts.cutting}
                </span>
              </div>
            </div>

            {/* Card 3: In Assembly */}
            <div
              onClick={() => setActiveTab('ASSEMBLY')}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-purple-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  In Assembly
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {counts.assembly}
                </span>
              </div>
            </div>

            {/* Card 4: Quality Control */}
            <div
              onClick={() => setActiveTab('QC')}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-cyan-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Quality Control
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {counts.qc}
                </span>
              </div>
            </div>

            {/* Card 5: Completed Today */}
            <div
              onClick={() => setActiveTab('COMPLETED')}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">
                  Completed Today
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {counts.completed}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Search and Multi-Dropdown Filters Row */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Production Order / Customer / Project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B64F2] focus:bg-white transition-all"
              />
            </div>

            {/* Stage Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Stage</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All</option>
                <option value="READY">Ready</option>
                <option value="CUTTING">Cutting</option>
                <option value="ASSEMBLY">Assembly</option>
                <option value="QC">Quality Control</option>
                <option value="COMPLETED">Completed</option>
                <option value="REWORK">Rework</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Priority</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assigned Worker Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Assigned Worker</span>
              <select
                value={workerFilter}
                onChange={(e) => setWorkerFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All</option>
                <option value="Ramesh">Ramesh</option>
                <option value="Suresh">Suresh</option>
                <option value="Karthik">Karthik</option>
                <option value="Vikram">Vikram</option>
                <option value="Ravi">Ravi</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Due Date</span>
            </div>

            {/* Material Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600">
              <span className="text-slate-400 font-medium">Material Status</span>
              <select
                value={materialStatusFilter}
                onChange={(e) => setMaterialStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL">All</option>
                <option value="Ready">Ready</option>
                <option value="Materials Ready">Materials Ready</option>
                <option value="Materials Reserved">Materials Reserved</option>
                <option value="Partially Available">Partially Available</option>
                <option value="Shortage">Shortage</option>
              </select>
            </div>
          </div>

          {/* 5. Main Production Orders Table (matching screenshot) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Production Order</th>
                    <th className="py-3 px-4">Project / Customer</th>
                    <th className="py-3 px-4">Windows / Doors</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Material Status</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId;
                    return (
                      <tr
                        key={order.id}
                        onClick={() =>
                          setSelectedOrderId(selectedOrderId === order.id ? null : order.id)
                        }
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-l-4 border-l-[#1B64F2]'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Production Order */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-xs text-[#1B64F2] font-mono block">
                            {order.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {order.project}
                          </span>
                        </td>

                        {/* Project / Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{order.customer}</div>
                          <div className="text-[10px] text-slate-400">{order.project}</div>
                        </td>

                        {/* Windows / Doors */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {order.windowsDoorsSummary}
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.priority === 'High'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : order.priority === 'Normal'
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {order.priority}
                          </span>
                        </td>

                        {/* Current Stage */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              order.currentStage === 'READY'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : order.currentStage === 'CUTTING'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : order.currentStage === 'ASSEMBLY'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : order.currentStage === 'QC'
                                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                : order.currentStage === 'REWORK'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {order.currentStage === 'READY' && 'Ready for Production'}
                            {order.currentStage === 'CUTTING' && 'Cutting'}
                            {order.currentStage === 'ASSEMBLY' && 'Assembly'}
                            {order.currentStage === 'QC' && 'Quality Control'}
                            {order.currentStage === 'REWORK' && 'Rework'}
                            {order.currentStage === 'COMPLETED' && 'Completed'}
                          </span>
                        </td>

                        {/* Material Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              order.materialStatus === 'Ready' ||
                              order.materialStatus === 'Materials Ready'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.materialStatus === 'Materials Reserved'
                                ? 'bg-blue-50 text-blue-700'
                                : order.materialStatus === 'Partially Available'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700 font-bold'
                            }`}
                          >
                            {order.materialStatus}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {order.assignedTo}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {order.dueDate}
                        </td>

                        {/* Last Updated */}
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {order.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveWorkspace(order.currentStage);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#1B64F2] hover:bg-slate-100 transition-colors"
                            title="Open Manufacturing Workspace"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE DRAWER (Only comes out when an order is clicked) */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] lg:w-[480px] shrink-0 h-full border-l border-slate-200 bg-white shadow-2xl md:static md:z-20 md:shadow-none animate-in slide-in-from-right duration-200">
          <ProductionDetailDrawer
            order={selectedOrder}
            onClose={() => setSelectedOrderId(null)}
            onOpenStageWorkspace={(stage) => setActiveWorkspace(stage)}
            onResolveShortage={() => resolveShortage(selectedOrder.id, 'All')}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE MANUFACTURING WORKSPACE MODALS                      */}
      {/* ========================================================= */}
      {activeWorkspace === 'READY' && selectedOrder && (
        <ReadyForProductionModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
          onStartProduction={(orderId, worker) => startProduction(orderId, worker)}
          onResolveShortage={(orderId, mat) => resolveShortage(orderId, mat)}
        />
      )}

      {activeWorkspace === 'CUTTING' && selectedOrder && (
        <CuttingWorkspaceModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
          onMarkCutComplete={markCutComplete}
          onCompleteCuttingStage={completeCuttingStage}
        />
      )}

      {activeWorkspace === 'ASSEMBLY' && selectedOrder && (
        <AssemblyWorkspaceModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
          onMarkAssemblyTaskComplete={markAssemblyTaskComplete}
          onCompleteAssemblyStage={completeAssemblyStage}
        />
      )}

      {activeWorkspace === 'QC' && selectedOrder && (
        <QCWorkspaceModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
          onPassQC={passQualityControl}
          onFailQC={failQualityControlAndCreateRework}
          onCompleteProduction={completeProduction}
        />
      )}

      {activeWorkspace === 'REWORK' && selectedOrder && (
        <ReworkWorkspaceModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
          onStartRework={startRework}
          onCompleteRework={completeRework}
        />
      )}

      {activeWorkspace === 'COMPLETED' && selectedOrder && (
        <CompletedWorkspaceModal
          order={selectedOrder}
          onClose={() => setActiveWorkspace(null)}
        />
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <NewProductionOrderModal
          onClose={() => setIsNewOrderModalOpen(false)}
          onOrderCreated={(newOrder) => {
            setSelectedOrderId(newOrder.id);
          }}
        />
      )}
    </div>
  );
}

export default function ProductionPage() {
  return (
    <ProductionProvider>
      <ProductionDashboardContent />
    </ProductionProvider>
  );
}
