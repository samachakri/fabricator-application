'use client';

import React, { useState } from 'react';
import { useBranding, SubscriptionTier } from '@/lib/branding-store';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsPage() {
  const { branding, updateBranding, setSubscriptionTier } = useBranding();

  const [companyName, setCompanyName] = useState(branding.companyName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [phone, setPhone] = useState(branding.phone);
  const [email, setEmail] = useState(branding.email);
  const [address, setAddress] = useState(branding.address);
  const [gstin, setGstin] = useState(branding.gstin);
  const [poweredByText, setPoweredByText] = useState(branding.poweredByText);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      companyName,
      tagline,
      phone,
      email,
      address,
      gstin,
      poweredByText,
    });
    setSavedSuccess(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTierSwitch = (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings & Company Branding
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your business identity for client quotations and configure your subscription tier.
        </p>
      </div>

      {/* Subscription Tier Switcher Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A2E8A] to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Active Tier: {branding.subscriptionTier} Plan
            </span>
            {branding.subscriptionTier === 'Pro' && (
              <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All Features Unlocked
              </span>
            )}
          </div>
          <h2 className="text-xl font-black mt-2">
            {branding.subscriptionTier === 'Pro'
              ? 'FabricatorPro Enterprise Pro Suite'
              : 'FabricatorPro Standard Plan'}
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            {branding.subscriptionTier === 'Pro'
              ? 'You have unlimited access to raw material inventory tracking, 1D stock cut optimization, WhatsApp dispatch, and multi-station production.'
              : 'Standard plan includes fast dimensional window entry, parametric calculations, auto-quotations, and PDF generation.'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm border border-white/20">
          <button
            onClick={() => handleTierSwitch('Standard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              branding.subscriptionTier === 'Standard'
                ? 'bg-white text-[#0A2E8A] shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Standard Plan
          </button>
          <button
            onClick={() => handleTierSwitch('Pro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              branding.subscriptionTier === 'Pro'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>PRO Plan</span>
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Branding Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0A2E8A]" />
            <span>Company Quotation Profile</span>
          </h3>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Business Name (Shown on Quotation Header) *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] font-semibold"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Company Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GSTIN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Factory / Workshop Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
          </div>

          {/* Powered by Footer */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Quotation Footer Attribution
            </label>
            <input
              type="text"
              value={poweredByText}
              onChange={(e) => setPoweredByText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A] text-slate-600 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This line appears at the very bottom of every generated quotation PDF.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Branding Updated Successfully!</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-2.5 bg-[#0A2E8A] hover:bg-[#08256E] text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Right: Live Preview Box (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quotation Header Preview
            </h4>

            {/* Mini Header Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-9 h-9 rounded-lg bg-[#0A2E8A] text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">
                    {companyName}
                  </p>
                  <p className="text-[10px] text-slate-500">{tagline}</p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-500">
                <p>📍 {address}</p>
                <p>📞 {phone} • ✉️ {email}</p>
                <p>GSTIN: <span className="font-mono font-semibold text-slate-700">{gstin}</span></p>
              </div>

              {/* Mini Footer Preview */}
              <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                {poweredByText}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
