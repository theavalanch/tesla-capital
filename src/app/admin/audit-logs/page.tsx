'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { FileText, Filter, ShieldCheck, Eye, X } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => {
    setLoading(true);
    const url = filterAction === 'ALL' ? '/api/admin/audit-logs' : `/api/admin/audit-logs?action=${filterAction}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08090C] text-[#F3F4F6]">
      <AdminSidebar />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Immutable Audit Trail</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete cryptographic audit records of all administrative adjustments, approvals, and platform modifications.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Audit Actions' },
            { id: 'BALANCE_ADJUSTMENT', label: 'Balance Adjustments' },
            { id: 'DEPOSIT_APPROVED', label: 'Deposit Approvals' },
            { id: 'WITHDRAWAL_APPROVED', label: 'Withdrawal Approvals' },
            { id: 'WITHDRAWAL_COMPLETED', label: 'Withdrawal Settlements' },
            { id: 'USER_PROFILE_UPDATED', label: 'User Updates' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterAction === f.id
                  ? 'bg-[#E82127] text-white shadow-md shadow-[#E82127]/25 font-semibold'
                  : 'bg-[#0E1117] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Audit Log Table */}
        <div className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#141822]/60 text-gray-400 font-medium">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Admin Operator</th>
                  <th className="py-4 px-6">Target User</th>
                  <th className="py-4 px-6">Details Snapshot</th>
                  <th className="py-4 px-6 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      {loading ? 'Loading audit trail...' : 'No audit entries found.'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/10 text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">
                        {log.adminEmail}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {log.targetUserEmail || 'N/A (Global)'}
                      </td>
                      <td className="py-4 px-6 text-gray-400 font-mono text-[11px] max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Inspection Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#0E1117] border border-white/10 p-6 space-y-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Transaction Record</span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono">{selectedLog.action}</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                  <span>Log ID:</span>
                  <span className="font-mono text-white">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                  <span>Timestamp:</span>
                  <span className="font-mono text-white">{selectedLog.createdAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                  <span>Admin Operator:</span>
                  <span className="font-mono text-white">{selectedLog.adminEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-gray-400">
                  <span>Target Account:</span>
                  <span className="font-mono text-white">{selectedLog.targetUserEmail || 'System'}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-300 mb-1.5">Parsed State Payload</div>
                <pre className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-56">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Close Audit Viewer
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
