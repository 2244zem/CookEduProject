import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { FileText, User, Activity, Calendar, Search } from 'lucide-react'
import { useState } from 'react'

export default function AuditLog() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['audit-logs', page, action],
    queryFn: () => auditApi.list({ page, action: action || undefined }),
  })

  const logs = auditData?.data?.data || []
  const pagination = auditData?.data

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-50 text-green-600'
      case 'updated': return 'bg-blue-50 text-blue-600'
      case 'deleted': return 'bg-red-50 text-red-600'
      case 'restored': return 'bg-purple-50 text-purple-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Audit Log System</h1>
        <div className="flex gap-2">
            <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}
                className="px-4 py-2 rounded-xl bg-white border border-gray-100 text-sm shadow-sm">
                <option value="">Semua Aksi</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="restored">Restored</option>
            </select>
        </div>
      </div>

      {isLoading ? <TableSkeleton rows={10} /> : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-dim)] text-left">
                  <th className="px-6 py-4 font-semibold text-[var(--color-text-secondary)]">Waktu</th>
                  <th className="px-6 py-4 font-semibold text-[var(--color-text-secondary)]">User</th>
                  <th className="px-6 py-4 font-semibold text-[var(--color-text-secondary)]">Aksi</th>
                  <th className="px-6 py-4 font-semibold text-[var(--color-text-secondary)]">Model</th>
                  <th className="px-6 py-4 font-semibold text-[var(--color-text-secondary)]">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[var(--color-text-muted)]">Belum ada data audit log.</td></tr>
                ) : logs.map((log: any) => (
                  <tr key={log.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs whitespace-nowrap text-[var(--color-text-secondary)]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(log.created_at).toLocaleString('id-ID')}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] shrink-0">
                                {log.user?.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium">{log.user?.name || 'System'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[var(--color-text-muted)]">
                        {log.model_type.split('\\').pop()} (#{log.model_id})
                    </td>
                    <td className="px-6 py-4">
                        <button className="text-[var(--color-primary)] text-xs font-semibold hover:underline flex items-center gap-1" onClick={() => console.log(log.new_values || log.old_values)}>
                            <Activity className="w-3 h-3" /> View Data
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-4 bg-[var(--color-surface-dim)] border-t border-gray-50 flex items-center justify-center gap-2">
                {Array.from({ length: pagination.last_page }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'gradient-primary text-white shadow-md' : 'bg-white text-[var(--color-text-secondary)] hover:bg-gray-100'}`}>
                        {i + 1}
                    </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
