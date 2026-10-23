import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  MessageCircle,
  X
} from 'lucide-react';
import { Enquiry, EnquiryStatus } from '../../types';
import { updateEnquiryStatus, deleteEnquiry } from '../../firebase/firestore';

interface EnquiriesTabProps {
  enquiries: Enquiry[];
}

export const EnquiriesTab: React.FC<EnquiriesTabProps> = ({ enquiries }) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
    } catch (err) {
      console.error('Update enquiry status error:', err);
    }
  };

  const handleDelete = async (enquiryId: string) => {
    if (confirm('Delete this client enquiry record?')) {
      try {
        await deleteEnquiry(enquiryId);
        if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
          setSelectedEnquiry(null);
        }
      } catch (err) {
        console.error('Delete enquiry error:', err);
      }
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
    const matchesSearch =
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customerPhone.includes(searchTerm) ||
      e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Client Consultation & Support Requests
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Bespoke design enquiries, private appointment requests, and client contact information.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#8C867D]">Total Enquiries:</span>
          <span className="font-bold text-[#121214] bg-white px-2 py-1 rounded border border-[#E8E2D9]">
            {enquiries.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C867D] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, mobile phone, subject, or message..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCD5C9] rounded-sm bg-white focus:border-[#9A7B4F] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {['All', 'New', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
                filterStatus === st
                  ? 'bg-[#121214] text-[#E5D5BA] font-bold'
                  : 'bg-white text-[#5C564D] hover:bg-[#FAF9F6] border border-[#E8E2D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEnquiries.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-[#8C867D] text-xs border border-[#E8E2D9] rounded-sm">
            No enquiries found matching your filters.
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-sm border border-[#E8E2D9] p-5 shadow-sm hover:border-[#9A7B4F] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                    enq.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : enq.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {enq.status}
                  </span>
                  <span className="text-[10px] text-[#8C867D]">
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif-luxury text-base font-bold text-[#121214] mb-0.5">
                  {enq.customerName}
                </h3>
                <div className="text-xs font-semibold text-[#9A7B4F] mb-3">{enq.subject}</div>

                <p className="text-xs text-[#5C564D] font-light leading-relaxed mb-4 bg-[#FAF9F6] p-3 rounded border border-[#F0EBE1] line-clamp-3">
                  "{enq.message}"
                </p>

                <div className="space-y-1 text-xs text-[#736D64] mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#9A7B4F]" />
                    <span className="font-semibold text-[#121214]">{enq.customerPhone}</span>
                  </div>
                  {enq.customerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#9A7B4F]" />
                      <span className="truncate">{enq.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${enq.customerPhone}`}
                    className="p-1.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white rounded text-xs flex items-center gap-1 font-semibold"
                    title="Direct Call"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/91${enq.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${enq.customerName}, this is LUXEUPHO regarding your enquiry on "${enq.subject}".`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-green-700 text-white hover:bg-green-800 rounded text-xs flex items-center gap-1 font-semibold"
                    title="WhatsApp Client"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                    className="text-[11px] px-2 py-1 border border-[#DCD5C9] rounded bg-white text-[#121214] font-medium"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDelete(enq.id)}
                    className="p-1 text-[#8C867D] hover:text-red-700 ml-1"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
