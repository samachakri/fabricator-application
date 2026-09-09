'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Project } from '@/lib/types';
import { X, DollarSign, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecordPaymentModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { recordPayment } = useStore();

  const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalValue = project.estimatedValue || 240000;
  const advanceRequired = project.quotation?.advanceRequired || Math.round(totalValue * 0.5);
  const remainingAdvance = Math.max(0, advanceRequired - totalPaid);
  const balanceOverall = Math.max(0, totalValue - totalPaid);

  const [amount, setAmount] = useState(
    remainingAdvance > 0 ? remainingAdvance : balanceOverall
  );
  const [paymentType, setPaymentType] = useState<
    'Advance (50%)' | 'Mid-Production (30%)' | 'Final Balance (20%)' | 'Custom'
  >(remainingAdvance > 0 ? 'Advance (50%)' : 'Mid-Production (30%)');
  const [method, setMethod] = useState<'UPI' | 'Bank NEFT/RTGS' | 'Cheque' | 'Cash'>(
    'Bank NEFT/RTGS'
  );
  const [reference, setReference] = useState('HDFC-NEFT-99' + Math.floor(1000 + Math.random() * 9000));
  const [notes, setNotes] = useState('Payment received and verified for order production.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    recordPayment(project.id, {
      amount: Number(amount),
      paymentType,
      method,
      reference,
      date: new Date().toISOString().split('T')[0],
      notes,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Record Project Payment</h2>
              <p className="text-xs text-slate-500">
                {project.name} ({project.id})
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

        {/* Financial Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Order</p>
            <p className="text-sm font-bold text-slate-800">
              ₹{totalValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Received</p>
            <p className="text-sm font-bold text-emerald-600">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Balance Due</p>
            <p className="text-sm font-bold text-slate-900">
              ₹{balanceOverall.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Payment Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                required
                min="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Payment Milestone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Milestone Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              >
                <option value="Advance (50%)">Advance (50%)</option>
                <option value="Mid-Production (30%)">Mid-Production (30%)</option>
                <option value="Final Balance (20%)">Final Balance (20%)</option>
                <option value="Custom">Custom Milestone</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
              >
                <option value="Bank NEFT/RTGS">Bank NEFT/RTGS</option>
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Cheque">Bank Cheque</option>
                <option value="Cash">Cash Handover</option>
              </select>
            </div>
          </div>

          {/* Reference / UTR Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Bank Ref / Transaction ID
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2E8A]/20 focus:border-[#0A2E8A]"
            />
          </div>

          {/* Production Unlock Badge Callout */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-[#0A2E8A] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Production Prerequisite Verification</p>
              <p className="text-[11px] text-blue-700">
                Recording ≥ ₹{advanceRequired.toLocaleString()} advance automatically unlocks the
                manufacturing shop-floor stage and cutting optimization.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:shadow"
            >
              Record Payment & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
