import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { submitEnquiry } from '../firebase/firestore';

export const SupportForm: React.FC = () => {
  const { settings } = useSettings();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPinCode, setCustomerPinCode] = useState('');
  const [subject, setSubject] = useState(
    'Architectural Interior Consultation'
  );
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const inputClass =
    'w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border-2 border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-all shadow-xs';

  const labelClass =
    'block text-xs uppercase tracking-wider font-normal text-[#1C1917] mb-1.5';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage(
        'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    if (!customerAddress.trim()) {
      setErrorMessage('Please enter your complete customer address.');
      return;
    }

    if (!/^\d{6}$/.test(customerPinCode)) {
      setErrorMessage('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage(
        'Please enter your message or project requirements.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const enquiryId = await submitEnquiry({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim(),
        customerPinCode: customerPinCode,
        subject,
        message: message.trim(),
      });

      setSuccessId(enquiryId);

      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
      setCustomerPinCode('');
      setSubject('Architectural Interior Consultation');
      setMessage('');
    } catch (err: unknown) {
      console.error('Support enquiry error:', err);

      setErrorMessage(
        'Unable to submit enquiry. Please call concierge directly at 9704796170.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="support-section"
      className="py-20 bg-[#FAF6F0] text-[#1C1917] border-t border-[#E5DBCB] relative overflow-hidden"
    >
      {/* Decorative warm ambient glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#DFCDAA]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#B88E52]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Official Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0DD] border border-[#E8DFC9] text-[#8C7654] text-xs font-normal tracking-[0.25em] uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E52]" />
                <span>Private Consultation</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide text-[#1C1917] leading-tight">
                Design Your Dream Sanctuary
              </h2>

              <p className="mt-3 text-sm text-[#57534E] font-light leading-relaxed">
                Connect with LUXEUPHO’s senior interior architects for
                floorplan consultations, custom material finishes, or
                tailored showroom viewings.
              </p>
            </div>

            {/* Official Contact Cards */}
            <div className="space-y-3.5">
              <a
                href={settings.phone ? `tel:${settings.phone}` : undefined}
                className="p-4 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] transition-colors flex items-center gap-4 group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] group-hover:bg-[#B88E52] group-hover:text-white transition-colors shrink-0">
                  <Phone className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-normal block">
                    Direct Customer Care &amp; WhatsApp
                  </span>
                  <span className="font-serif text-base sm:text-lg font-normal text-[#1C1917] group-hover:text-[#B88E52] transition-colors">
                    {settings.phone || 'Contact us'}
                  </span>
                </div>
              </a>

              <a
                href={settings.email ? `mailto:${settings.email}` : undefined}
                className="p-4 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] transition-colors flex items-center gap-4 group shadow-sm"
              >
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] group-hover:bg-[#B88E52] group-hover:text-white transition-colors shrink-0">
                  <Mail className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-normal block">
                    Customer Support Email
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-[#1C1917] group-hover:text-[#B88E52] transition-colors break-all">
                    {settings.email || 'Contact us'}
                  </span>
                </div>
              </a>

              <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] flex items-center gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-normal block">
                    Concierge Hours
                  </span>
                  <span className="text-xs text-[#1C1917] font-normal">
                    Monday – Sunday: 10:00 AM – 7:00 PM IST
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Support / Consultation Form */}
          <div className="lg:col-span-7 bg-white border-2 border-[#D6C7B2] rounded-2xl p-6 sm:p-8 shadow-md relative">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] mb-1.5 tracking-wide">
              Send an Enquiry or Service Request
            </h3>

            <p className="text-xs text-[#78716C] font-light mb-6">
              Share your contact details and delivery address so our
              management team can assist you with your enquiry.
            </p>

            {successId ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h4 className="font-serif text-xl font-normal text-[#1C1917]">
                  Enquiry Submitted Successfully
                </h4>

                <p className="text-xs text-[#57534E] max-w-sm mx-auto leading-relaxed font-light">
                  Thank you. Your request (Ref: #
                  {successId.slice(0, 8)}) has been saved to our management
                  queue. Our concierge will contact you on your registered
                  phone number shortly.
                </p>

                <button
                  type="button"
                  onClick={() => setSuccessId(null)}
                  className="mt-4 px-6 py-2.5 bg-[#B88E52] text-white text-xs uppercase tracking-widest font-normal rounded-lg hover:bg-[#A57D43] transition-colors"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Customer Name and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-name" className={labelClass}>
                      Customer Name *
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="customer-phone" className={labelClass}>
                      Phone Number *
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      required
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      placeholder="10-digit mobile number"
                      pattern="[6-9][0-9]{9}"
                      title="Enter a valid 10-digit Indian mobile number"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email and Enquiry Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-email" className={labelClass}>
                      Email Address (Optional)
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="enquiry-subject" className={labelClass}>
                      Subject / Enquiry Type
                    </label>
                    <select
                      id="enquiry-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Architectural Interior Consultation">
                        Architectural Interior Consultation
                      </option>
                      <option value="Bespoke Custom Furniture Order">
                        Bespoke Custom Furniture Order
                      </option>
                      <option value="Showroom Private Appointment">
                        Showroom Private Appointment
                      </option>
                      <option value="Order Status & Delivery Query">
                        Order Status &amp; Delivery Query
                      </option>
                      <option value="Material & Fabric Swatch Request">
                        Material &amp; Fabric Swatch Request
                      </option>
                      <option value="General Customer Care">
                        General Customer Care
                      </option>
                    </select>
                  </div>
                </div>

                {/* NEW: Customer Address */}
                <div>
                  <label htmlFor="customer-address" className={labelClass}>
                    Customer / Delivery Address *
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#B88E52]" />

                    <textarea
                      id="customer-address"
                      name="customerAddress"
                      autoComplete="street-address"
                      required
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House / Flat No., Street, Area, City, State"
                      className={`${inputClass} pl-10 resize-y`}
                    />
                  </div>
                </div>

                {/* NEW: Customer PIN Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-pincode" className={labelClass}>
                      PIN Code *
                    </label>

                    <input
                      id="customer-pincode"
                      name="customerPinCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      required
                      maxLength={6}
                      minLength={6}
                      pattern="[0-9]{6}"
                      value={customerPinCode}
                      onChange={(e) =>
                        setCustomerPinCode(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit PIN code"
                      title="Enter a valid 6-digit PIN code"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Customer Message */}
                <div>
                  <label htmlFor="customer-message" className={labelClass}>
                    Your Message / Requirements *
                  </label>

                  <textarea
                    id="customer-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your space, dimensions, preferred aesthetic, or specific furniture requirements..."
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#B88E52] text-white hover:bg-[#A57D43] transition-all text-xs uppercase tracking-[0.16em] font-normal rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-[10px] text-[#78716C] leading-relaxed">
                  Your address and PIN code help us understand your delivery
                  location and service requirements.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};