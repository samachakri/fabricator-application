'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBranding } from '@/lib/branding-store';
import {
  LayoutDashboard,
  Compass,
  Banknote,
  Package,
  FileText,
  Factory,
  Settings,
  User,
  Plus,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  onNewProjectClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewProjectClick }) => {
  const pathname = usePathname();
  const { branding } = useBranding();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Design', href: '/projects/PRJ-1042', icon: Compass },
    { label: 'Sales', href: '/sales', icon: Banknote },
    { label: 'Inventory', href: '/inventory', icon: Package },
    { label: 'Quotations', href: '/projects/PRJ-1042/quotation', icon: FileText },
    { label: 'Production', href: '/projects/PRJ-1042/production', icon: Factory },
  ];

  const bottomItems = [
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Profile', href: '/settings', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    if (href === '/inventory') return pathname.startsWith('/inventory');
    if (href === '/sales') return pathname.startsWith('/sales');
    if (href === '/settings') return pathname.startsWith('/settings');
    if (href.includes('/quotation')) return pathname.includes('/quotation');
    if (href.includes('/production')) return pathname.includes('/production');
    if (href.includes('/projects/'))
      return (
        pathname.startsWith('/projects') &&
        !pathname.includes('/quotation') &&
        !pathname.includes('/production')
      );
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0A2E8A] flex items-center justify-center text-white shadow-sm shadow-blue-900/20">
              <Layers className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">
                Fabricator<span className="text-[#0A2E8A]">Pro</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                MANUFACTURING SUITE
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action: + New Project */}
        <div className="p-4">
          <button
            onClick={onNewProjectClick}
            className="w-full bg-[#0A2E8A] hover:bg-[#08256E] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow hover:scale-[1.01] active:scale-[0.99] text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-50 text-[#0A2E8A] font-semibold border-r-4 border-[#0A2E8A]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? 'text-[#0A2E8A]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav: Settings & Profile */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-50 text-[#0A2E8A] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* User Mini Profile */}
        <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0A2E8A] font-bold text-xs flex items-center justify-center ring-2 ring-blue-50 shrink-0">
              CR
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Chakri Reddy
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {branding.companyName.split(' ')[0]}
              </p>
            </div>
          </div>

          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {branding.subscriptionTier}
          </span>
        </div>
      </div>
    </aside>
  );
};
