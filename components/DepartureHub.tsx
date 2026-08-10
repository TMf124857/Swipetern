import React, { useState, useEffect } from 'react';
import { supabase } from '../services/db';

export interface ComplianceStatus {
  university_approval: 'pending' | 'approved' | 'rejected';
  visa_status: 'pending' | 'approved' | 'rejected' | 'not_required';
  travel_docs: 'pending' | 'approved' | 'rejected';
}

interface DepartureHubProps {
  matchId: string;
  currentUserRole: 'student' | 'employer' | 'admin';
  initialComplianceStatus?: ComplianceStatus;
  onUpdate?: (newStatus: ComplianceStatus, percentage: number) => void;
}

export const DepartureHub: React.FC<DepartureHubProps> = ({
  matchId,
  currentUserRole,
  initialComplianceStatus,
  onUpdate,
}) => {
  const [compliance, setCompliance] = useState<ComplianceStatus>({
    university_approval: 'pending',
    visa_status: 'pending',
    travel_docs: 'pending',
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize compliance status state
  useEffect(() => {
    if (initialComplianceStatus) {
      setCompliance(initialComplianceStatus);
    } else if (matchId) {
      fetchMatchCompliance();
    }
  }, [matchId, initialComplianceStatus]);

  const fetchMatchCompliance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('compliance_status')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      if (data && data.compliance_status) {
        setCompliance(data.compliance_status as ComplianceStatus);
      }
    } catch (err) {
      console.error('Error fetching compliance status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to mathematically compute progress percentage
  const calculateProgress = (status: ComplianceStatus): number => {
    let approvedCount = 0;
    const totalSteps = 3;

    if (status.university_approval === 'approved') approvedCount++;
    if (status.visa_status === 'approved' || status.visa_status === 'not_required') approvedCount++;
    if (status.travel_docs === 'approved') approvedCount++;

    return Math.round((approvedCount / totalSteps) * 100);
  };

  const handleStatusChange = async (
    key: keyof ComplianceStatus,
    value: 'pending' | 'approved' | 'rejected' | 'not_required'
  ) => {
    // Role Authorization guard
    // Only 'employer' or 'admin' can transition keys to 'approved'
    if (value === 'approved' && currentUserRole === 'student') {
      alert('Unauthorized: Only employer or administrator roles can approve verification steps.');
      return;
    }

    const updatedCompliance = {
      ...compliance,
      [key]: value,
    };

    setCompliance(updatedCompliance);
    const newPercentage = calculateProgress(updatedCompliance);

    // Save to Supabase DB
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          compliance_status: updatedCompliance,
          progress_percentage: newPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (error) throw error;

      if (onUpdate) {
        onUpdate(updatedCompliance, newPercentage);
      }
    } catch (err) {
      console.error('Failed to update compliance:', err);
    }
  };

  const progressPercentage = calculateProgress(compliance);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-6 text-left">
      <div>
        <span className="text-xs font-extrabold tracking-widest text-fuchsia-400 uppercase">
          Departure Checklist
        </span>
        <h2 class="text-xl font-black text-slate-100 mt-1 leading-snug">
          Onboarding Progress Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Complete the required corridor checkpoints to secure international deployment logistics.
        </p>
      </div>

      {/* Dynamic Animated Progress Bar */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-extrabold text-slate-400">Verification Integrity</span>
          <span className="text-sm font-black text-fuchsia-400">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Sequential Checklist Checkpoints */}
      <div className="space-y-3">
        {/* Step 1: University Approval */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-200">1. University Approval</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Syllabus ECTS accreditation logs.</p>
          </div>
          <select
            value={compliance.university_approval}
            onChange={(e) =>
              handleStatusChange('university_approval', e.target.value as any)
            }
            className="text-xs font-bold border border-slate-800 rounded-lg p-1.5 bg-slate-900 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
            style={{ minHeight: '36px' }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Step 2: Visa & Work Permit */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-200">2. Visa & Work Permit</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Special East African permit processing.</p>
          </div>
          <select
            value={compliance.visa_status}
            onChange={(e) => handleStatusChange('visa_status', e.target.value as any)}
            className="text-xs font-bold border border-slate-800 rounded-lg p-1.5 bg-slate-900 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
            style={{ minHeight: '36px' }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="not_required">Not Required</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Step 3: Travel Documents */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-200">3. Travel Documents</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Yellow Fever logs and itineraries.</p>
          </div>
          <select
            value={compliance.travel_docs}
            onChange={(e) => handleStatusChange('travel_docs', e.target.value as any)}
            className="text-xs font-bold border border-slate-800 rounded-lg p-1.5 bg-slate-900 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
            style={{ minHeight: '36px' }}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
};
