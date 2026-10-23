import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { submitEnquiry } from '../firebase/firestore';

export const SupportForm: React.FC = () => {
  const { settings } = useSettings();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('Architectural Interior Consultation');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Please enter your message or project requirements.');
      return;
    }

    setSubmitting(true);

    try {
      const enquiryId = await submitEnquiry({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        subject,
        message: message.trim(),
      });

      setSuccessId(enquiryId);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Support enquiry error:', err);
      setErrorMessage('Unable to submit enquiry. Please call concierge directly at 9704796170.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="support-section" className="py-20 bg-[#FAF6F0] text-[#1C1917] border-t border-[#E5DBCB] relative overflow-hidden">
      {/* Decorative warm ambient glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#DFCDAA]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#B88E52]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Official Contact & Bespoke Atelier Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0DD] border border-[#E8DFC9] text-[#8C7654] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E52]" />
                <span>Private Consultation</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] leading-tight">
                Design Your Dream Sanctuary
              </h2>
              <p className="mt-3 text-sm text-[#57534E] font-light leading-relaxed">
                Connect with LUXEUPHO’s senior interior architects for floorplan consultations, custom material finishes, or tailored showroom viewings.
              </p>
            </div>

            {/* Direct Official Contact Cards */}
            <div className="space-y-3.5">
              <a
                href={`tel:${settings.phone}`}
                className="p-4 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] transition-colors flex items-center gap-4 group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] group-hover:bg-[#B88E52] group-hover:text-white transition-colors shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block">
                    Direct Customer Care &amp; WhatsApp
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#1C1917] group-hover:text-[#B88E52] transition-colors">
                    {settings.phone}
                  </span>
                </div>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="p-4 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] transition-colors flex items-center gap-4 group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] group-hover:bg-[#B88E52] group-hover:text-white transition-colors shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block">
                    Customer Support Email
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#B88E52] transition-colors break-all">
                    {settings.email}
                  </span>
                </div>
              </a>

              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] flex items-center gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block">
                    Concierge Hours
                  </span>
                  <span className="text-xs text-[#1C1917] font-medium">
                    Monday &ndash; Sunday: 10:00 AM &ndash; 8:00 PM IST
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Support / Consultation Form */}
          <div className="lg:col-span-7 bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-md relative">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] mb-1.5">
              Send an Enquiry or Service Request
            </h3>
            <p className="text-xs text-[#78716C] mb-6">
              All details, including contact numbers, are stored securely and reviewed promptly by our management.
            </p>

            {successId ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#1C1917]">
                  Enquiry Submitted Successfully
                </h4>
                <p className="text-xs text-[#57534E] max-w-sm mx-auto leading-relaxed">
                  Thank you. Your request (Ref: #{successId.slice(0, 8)}) has been saved to our management queue. Our concierge will contact you on your registered phone number shortly.
                </p>
                <button
                  onClick={() => setSuccessId(null)}
                  className="mt-4 px-6 py-2.5 bg-[#B88E52] text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#A57D43] transition-colors"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9704796170"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                      Subject / Enquiry Type
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none"
                    >
                      <option value="Architectural Interior Consultation">Architectural Interior Consultation</option>
                      <option value="Bespoke Custom Furniture Order">Bespoke Custom Furniture Order</option>
                      <option value="Showroom Private Appointment">Showroom Private Appointment</option>
                      <option value="Order Status & Delivery Query">Order Status &amp; Delivery Query</option>
                      <option value="Material & Fabric Swatch Request">Material &amp; Fabric Swatch Request</option>
                      <option value="General Customer Care">General Customer Care</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                    Your Message / Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your space, dimensions, preferred aesthetic, or specific piece inquiries..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#B88E52] text-white hover:bg-[#A57D43] transition-all text-xs uppercase tracking-[0.16em] font-bold rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Enquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Consultation Request</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
