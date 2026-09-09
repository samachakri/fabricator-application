'use client';

import React from 'react';
import { useBranding } from '@/lib/branding-store';
import {
  X,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  Scissors,
  Share2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName = 'Add Inventory & Stock Management',
}) => {
  const { setSubscriptionTier } = useBranding();

  if (!isOpen) return null;

  const handleActivateTrial = () => {
    setSubscriptionTier('Pro');
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    onClose();
  };

  const proFeatures = [
    {
      icon: PackageCheck,
      title: 'Full Raw Material Inventory & Reorder Alerts',
      desc: 'Track profile extrusions, glass sheets, hardware bins, and auto-reserve stock for fabrication orders.',
    },
    {
      icon: Scissors,
      title: '1D Linear Profile Cut Stock Optimizer',
      desc: 'Smart 6-meter nesting algorithm that minimizes profile scrap waste down to 3-5%.',
    },
    {
      icon: Share2,
      title: '1-Click WhatsApp & Email Quotation Dispatch',
      desc: 'Send branded PDF quotes directly to clients with custom company branding & logo.',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Station Shop Floor & QC Inspector Console',
      desc: 'Dedicated saw operator checklists with 45°/90° cut angles and rework routing.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Banner Header */}
        <div className="bg-gradient-to-r from-[#0A2E8A] via-[#1D34BA] to-[#0A2570] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Pro Tier Exclusive</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight leading-snug">
            Unlock {featureName}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            This advanced fabrication feature is available on the{' '}
            <strong className="text-white underline decoration-amber-400">
              FabricatorPro Pro Plan
            </strong>
            .
          </p>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            What you get with Pro:
          </p>

          <div className="space-y-3">
            {proFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0A2E8A] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Box */}
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0A2E8A]">Pro Subscription</p>
              <p className="text-[11px] text-slate-500">
                Cancel anytime • Zero hardware setup
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-slate-900 font-mono">
                ₹2,499
              </span>
              <span className="text-xs text-slate-500 font-medium"> / month</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Maybe Later
            </button>

            <button
              onClick={handleActivateTrial}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#0A2E8A] to-[#1D34BA] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>Activate 14-Day Free Pro Trial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
