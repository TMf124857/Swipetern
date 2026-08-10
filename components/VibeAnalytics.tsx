import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface VibeAnalyticsProps {
  matchComplianceData?: {
    ready: number;
    in_progress: number;
    not_ready: number;
  };
}

export const VibeAnalytics: React.FC<VibeAnalyticsProps> = ({
  matchComplianceData = { ready: 12, in_progress: 24, not_ready: 8 },
}) => {
  // Financial Model: Customer Acquisition Cost vs. Lifetime Value
  const cacData = [
    { name: 'Student Loop', CAC: 15, LTV: 180 },
    { name: 'Startup', CAC: 120, LTV: 1600 },
    { name: 'Enterprise', CAC: 500, LTV: 8000 },
  ];

  // Compliance completion summary data
  const pieData = [
    { name: 'Fully Compliant', value: matchComplianceData.ready, color: '#10b981' }, // emerald
    { name: 'In Progress', value: matchComplianceData.in_progress, color: '#f59e0b' }, // amber
    { name: 'Action Needed', value: matchComplianceData.not_ready, color: '#f43f5e' }, // rose
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* 1. CAC vs. LTV Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between shadow-xl text-left">
        <div className="mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-fuchsia-400">
            Platform Economics
          </span>
          <h3 className="font-extrabold text-slate-100 text-base mt-0.5">
            Customer Acquisition Cost vs. Lifetime Value
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Modeling direct margins powered by early campus loops.
          </p>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cacData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#cbd5e1',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Bar dataKey="CAC" fill="#d946ef" radius={[4, 4, 0, 0]} name="CAC ($)" />
              <Bar dataKey="LTV" fill="#10b981" radius={[4, 4, 0, 0]} name="LTV ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Compliance Completion Summary */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between shadow-xl text-left">
        <div className="mb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
            Operations Insights
          </span>
          <h3 className="font-extrabold text-slate-100 text-base mt-0.5">
            Compliance Status Breakdown
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Active match progress distributions inside the corridor ecosystem.
          </p>
        </div>

        <div className="w-full h-64 flex flex-col sm:flex-row items-center justify-center">
          <div className="w-full sm:w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#cbd5e1',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legends */}
          <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-3 pl-0 sm:pl-4 mt-4 sm:mt-0">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2.5 text-xs font-semibold">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300">{item.name}:</span>
                <span className="text-slate-100 font-bold">{item.value} matches</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
