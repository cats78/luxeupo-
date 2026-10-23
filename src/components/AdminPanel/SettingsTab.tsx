import React, { useState } from 'react';
import { Save, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { StoreSettings } from '../../types';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [phone, setPhone] = useState(settings.phone || '9704796170');
  const [email, setEmail] = useState(settings.email || 'luxeuphohomeinteriors@gmail.com');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [freeShippingMin, setFreeShippingMin] = useState<number>(settings.freeShippingMin || 25000);
  const [address, setAddress] = useState(settings.address || '');

  // Payment Gateway & Banking Details (Saved for Future Activation)
  const [paymentGatewayProvider, setPaymentGatewayProvider] = useState(settings.paymentGatewayProvider || 'PhonePe');
  const [upiId, setUpiId] = useState(settings.upiId || '9704796170@upi');
  const [merchantName, setMerchantName] = useState(settings.merchantName || 'LUXEUPHO FURNITURE & HOME INTERIORS');
  const [bankName, setBankName] = useState(settings.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(settings.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(settings.ifscCode || '');
  const [gatewayKeyId, setGatewayKeyId] = useState(settings.gatewayKeyId || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSavedSuccess(false);

    try {
      const newSettings: StoreSettings = {
        logoUrl: logoUrl.trim(),
        phone: phone.trim(),
        email: email.trim(),
        announcement: announcement.trim(),
        freeShippingMin: Number(freeShippingMin) || 0,
        address: address.trim(),
        paymentGatewayProvider: paymentGatewayProvider.trim(),
        upiId: upiId.trim(),
        merchantName: merchantName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        gatewayKeyId: gatewayKeyId.trim(),
        paymentsEnabled: false, // Explicitly keep disabled on storefront per user prompt
      };

      await updateSettings(newSettings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update settings error:', err);
      setError('Failed to persist settings. Please check database permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setLogoUrl('https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png');
    setPhone('9704796170');
    setEmail('luxeuphohomeinteriors@gmail.com');
    setAnnouncement('COMPLIMENTARY ARCHITECTURAL DESIGN CONSULTATION & WHITE-GLOVE PAN-INDIA INSTALLATION');
    setFreeShippingMin(25000);
    setAddress('LUXEUPHO Flagship Gallery, High Street Luxury Boulevard');
    setPaymentGatewayProvider('PhonePe');
    setUpiId('9704796170@upi');
    setMerchantName('LUXEUPHO FURNITURE & HOME INTERIORS');
    setBankName('HDFC Bank');
    setAccountNumber('');
    setIfscCode('');
    setGatewayKeyId('');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
          Storefront Branding, Contact &amp; Payment Configurations
        </h2>
        <p className="text-xs text-[#736D64] mt-0.5">
          Update the official logo, concierge phone number, support email, and pre-configure future payment gateway details.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Website configurations and future payment credentials saved successfully to Firestore!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-sm border border-[#E8E2D9] p-6 space-y-6 text-xs shadow-sm">
        
        {/* Logo Section */}
        <div className="space-y-3 pb-6 border-b border-[#F0EBE1]">
          <h3 className="font-bold text-[#121214] uppercase tracking-wider text-xs">
            1. Official Logo Emblem
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="p-3 border border-[#E8E2D9] bg-[#121214] rounded-sm shrink-0">
              <img
                src={logoUrl || 'https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png'}
                alt="Logo Preview"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png';
                }}
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="block text-[#5C564D] font-medium">
                Logo URL (PNG / WebP / SVG)
              </label>
              <input
                type="url"
                required
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
              <span className="text-[11px] text-[#8C867D] block">
                Official emblem pre-configured: <code>https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png</code>
              </span>
            </div>
          </div>
        </div>

        {/* Business Contact Section */}
        <div className="space-y-4 pb-6 border-b border-[#F0EBE1]">
          <h3 className="font-bold text-[#121214] uppercase tracking-wider text-xs">
            2. Customer Care &amp; Support Contacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Customer Care Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9704796170"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Customer Support Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="luxeuphohomeinteriors@gmail.com"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement & Delivery Thresholds */}
        <div className="space-y-4 pb-6 border-b border-[#F0EBE1]">
          <h3 className="font-bold text-[#121214] uppercase tracking-wider text-xs">
            3. Top Announcement &amp; Shipping Policy
          </h3>
          <div>
            <label className="block text-[#5C564D] font-medium mb-1">
              Top Bar Slogan / Announcement
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="COMPLIMENTARY ARCHITECTURAL DESIGN CONSULTATION & WHITE-GLOVE PAN-INDIA INSTALLATION"
              className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Complimentary White-Glove Setup Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingMin}
                onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                placeholder="25000"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Showroom Gallery Tagline / Physical Identity
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="LUXEUPHO Flagship Gallery, High Street Luxury Boulevard"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway & Banking Settings (Saved for Future Activation) */}
        <div className="space-y-4 pb-6 border-b border-[#F0EBE1]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#121214] uppercase tracking-wider text-xs">
              4. Payment Gateway &amp; Banking Details (Saved for Future Activation)
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-bold uppercase tracking-wider">
              Payments Currently Inactive
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F5] border border-[#E8DFC9] rounded text-xs space-y-1">
            <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B88E52]" />
              <span>Future Activation Setting</span>
            </div>
            <p className="text-[#78716C] leading-relaxed">
              Store your official UPI ID, merchant account, and banking details here. They will remain securely saved in Firestore so you can activate instant checkout as soon as payment onboarding is complete. Storefront checkouts currently display the launch notice: <em>“We’re creating a smooth shopping experience for you. Online ordering and payments will be available soon. No cash on delivery and no online payments for now.”</em>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Preferred Gateway Provider
              </label>
              <select
                value={paymentGatewayProvider}
                onChange={(e) => setPaymentGatewayProvider(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none bg-white"
              >
                <option value="PhonePe">PhonePe Business PG</option>
                <option value="Razorpay">Razorpay UPI &amp; Cards</option>
                <option value="Paytm">Paytm for Business</option>
                <option value="DirectUPI">Direct Showroom UPI QR</option>
              </select>
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Official Showroom UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="9704796170@upi"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Merchant / Account Holder Name
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="LUXEUPHO FURNITURE & HOME INTERIORS"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="HDFC Bank / ICICI Bank"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 50200012345678"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5C564D] font-medium mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#5C564D] font-medium mb-1">
                Gateway Key ID / Merchant ID (Stored securely for activation)
              </label>
              <input
                type="password"
                value={gatewayKeyId}
                onChange={(e) => setGatewayKeyId(e.target.value)}
                placeholder="MID_LIVE_..."
                className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-[#8C867D] hover:text-[#121214] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Official Brand Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C5A880]" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
