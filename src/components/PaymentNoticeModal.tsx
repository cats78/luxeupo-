import React from 'react';
import { Sparkles, X, MessageCircle, Phone, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface PaymentNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentNoticeModal: React.FC<PaymentNoticeModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DBCB] shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        
        {/* Top Gold Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#B88E52] via-[#DFCDAA] to-[#B88E52]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#FAF8F5] transition-colors"
          aria-label="Close Notice"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Brand */}
        <div className="w-14 h-14 rounded-full bg-[#FAF0DD] border border-[#E8DFC9] flex items-center justify-center mx-auto mb-4 text-[#B88E52]">
          <Sparkles className="w-7 h-7" />
        </div>

        <span className="text-[11px] uppercase tracking-[0.25em] text-[#B88E52] font-normal block mb-2 font-sans">
          LUXEUPHO Storefront Notice
        </span>

        {/* User Prompt Copy */}
        <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] leading-snug mb-3 tracking-wide">
          We’re creating a smooth shopping experience for you. Online ordering and payments will be available soon.
        </h3>

        <div className="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl text-xs text-[#57534E] leading-relaxed mb-6 font-normal">
          No cash on delivery and no online payments for now.
        </div>

        <p className="text-xs text-[#78716C] mb-6 leading-relaxed font-light">
          In the meantime, our showroom concierge is actively assisting clients with bespoke consultations, piece inquiries, and direct appointments.
        </p>

        {/* Actions: Direct WhatsApp & Call Concierge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`https://wa.me/91${settings.phone}?text=${encodeURIComponent('Hello LUXEUPHO, I would like to inquire about furniture pieces and bespoke orders.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-normal uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp</span>
          </a>

          <a
            href={`tel:${settings.phone}`}
            className="py-3 px-4 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-normal uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call {settings.phone}</span>
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-xs text-[#78716C] hover:text-[#1C1917] font-medium underline"
        >
          Continue Browsing Catalog
        </button>

      </div>
    </div>
  );
};
