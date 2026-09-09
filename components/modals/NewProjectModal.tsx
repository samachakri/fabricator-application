'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { X, Building2, UserPlus, UserCheck } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, createProject } = useStore();
  const router = useRouter();

  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
  });

  const [projectName, setProjectName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [projectType, setProjectType] = useState<'Residential' | 'Commercial' | 'Villa'>('Residential');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent, withDesign: boolean = true) => {
    if (e) e.preventDefault();
    if (customerMode === 'new') {
      if (!newCustomer.name.trim()) {
        alert('Please enter customer full name');
        return;
      }
      if (!newCustomer.phone.trim()) {
        alert('Please enter customer phone number');
        return;
      }
    }

    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const created = createProject({
      name: projectName.trim(),
      customerId: customerMode === 'existing' ? selectedCustomerId : undefined,
      newCustomer:
        customerMode === 'new'
          ? {
              name: newCustomer.name.trim(),
              phone: newCustomer.phone.trim(),
              email: newCustomer.email.trim(), // Optional: user can create lead even without email
              address: newCustomer.address.trim() || 'Site Address',
              city: newCustomer.city.trim() || 'Hyderabad',
            }
          : undefined,
      siteAddress: siteAddress.trim() || 'Site Location TBD',
      projectType,
      withInitialWindow: withDesign,
    });

    onClose();
    if (withDesign) {
      router.push(`/projects/${created.id}/design/W01`);
    } else {
      router.push(`/projects/${created.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0A2E8A] flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Create New Lead / Project</h2>
              <p className="text-xs text-slate-500">
                Setup customer and site details to start quotation & window design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, true)} noValidate className="p-6 space-y-4">
          {/* Customer Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Customer Assignment
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1 mb-3">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  customerMode === 'existing'
                    ? 'bg-white text-[#0A2E8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Existing Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  customerMode === 'new'
                    ? 'bg-white text-[#0A2E8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New Customer</span>
              </button>
            </div>

            {customerMode === 'existing' ? (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {c.city}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Customer Full Name *"
                  required
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    required
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                  />
                  <input
                    type="text"
                    placeholder="Email / Gmail (Optional)"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A] bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address / Area (Optional)"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A2E8A]"
                />
              </div>
            )}
          </div>

          {/* Project Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Reddy Villa Phase 2, Lakeview Penthouse"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              >
                <option value="Residential">Residential</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Commercial">Commercial / Office</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Site Address
              </label>
              <input
                type="text"
                placeholder="Plot/Street/City"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
          </div>

          {/* Design Transition Callout */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0A2E8A] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              CAD
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A2E8A]">Instant Window CAD Design</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Creates the project and opens 2D CAD canvas to set exact Width, Height, glass, and mesh before generating the final quotation.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(undefined, false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Save Lead Only
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(undefined, true)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0A2E8A] hover:bg-[#08256E] rounded-xl shadow-sm transition-all hover:shadow flex items-center gap-1.5"
              >
                <span>Create & Start Design</span>
                <span className="text-blue-200">→</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
