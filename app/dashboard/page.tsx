'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  Users,
  FileText,
  Factory,
  Banknote,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { projects } = useStore();

  const metrics = [
    {
      label: 'New Leads',
      value: '12',
      change: '+2 since yesterday',
      changeColor: 'text-blue-600',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Quotations Pending',
      value: '5',
      change: '3 urgent',
      changeColor: 'text-amber-600',
      icon: FileText,
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Production Orders',
      value: '8',
      change: 'On schedule',
      changeColor: 'text-emerald-600',
      icon: Factory,
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Payments Pending',
      value: '₹1.25L',
      change: 'Across 3 projects',
      changeColor: 'text-slate-500',
      icon: Banknote,
      iconBg: 'bg-slate-100 text-slate-700',
    },
  ];

  const myWorkItems = [
    {
      id: 'QT-1023',
      projectId: 'PRJ-1041',
      title: 'QT-1023',
      customer: 'Ramesh',
      status: 'Waiting for approval',
      statusStyle: 'bg-slate-100 text-slate-700',
      nextAction: 'Follow up',
    },
    {
      id: 'PRJ-1042',
      projectId: 'PRJ-1042',
      title: 'PRJ-1042',
      customer: 'Suresh',
      status: 'Advance received',
      statusStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      nextAction: 'Start production',
    },
    {
      id: 'PRJ-1038',
      projectId: 'PRJ-1040',
      title: 'PRJ-1038',
      customer: 'Anil',
      status: 'Profile shortage',
      statusStyle: 'bg-rose-50 text-rose-700 border border-rose-200',
      nextAction: 'Purchase VEKA 84BS',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header matching Screenshot 1 */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Good morning, Chakri
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </div>
                <p className={`text-xs mt-1 font-medium ${item.changeColor}`}>
                  {item.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section: My Work & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: My Work (5 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900">My Work</h2>
          <div className="space-y-3">
            {myWorkItems.map((work) => (
              <Link
                key={work.id}
                href={`/projects/${work.projectId}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#0A2E8A]/40 hover:shadow transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0A2E8A] group-hover:underline">
                    {work.title}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${work.statusStyle}`}
                  >
                    {work.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Customer: {work.customer}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-3 group-hover:text-[#0A2E8A] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A2E8A] group-hover:translate-x-0.5 transition-all" />
                  <span>Next: {work.nextAction}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Recent Projects Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Projects</h2>
            <Link
              href="/projects/PRJ-1042"
              className="text-xs font-semibold text-[#0A2E8A] hover:underline"
            >
              View All Projects &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Project</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Windows</th>
                    <th className="px-5 py-3.5">Value</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {projects.map((proj) => {
                    const statusBadgeClass =
                      proj.status === 'Advance Received'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : proj.status === 'Quotation Sent'
                        ? 'bg-blue-50 text-[#0A2E8A] border border-blue-100'
                        : proj.status === 'In Production'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-700';

                    return (
                      <tr
                        key={proj.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/projects/${proj.id}`}
                            className="font-bold text-[#0A2E8A] hover:underline"
                          >
                            {proj.id}
                          </Link>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {proj.name}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {proj.customer.name.split(' ')[0]}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {proj.windows.length > 0 ? proj.windows.length : 8}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                          ₹{(proj.estimatedValue / 100000).toFixed(1)}L
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-block ${statusBadgeClass}`}
                          >
                            {proj.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700 font-medium">
                          <Link
                            href={`/projects/${proj.id}`}
                            className="hover:text-[#0A2E8A] hover:underline"
                          >
                            {proj.nextAction}
                          </Link>
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
    </div>
  );
}
