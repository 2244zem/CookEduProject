/**
 * DataTable Component — Tabel data admin
 * Fitur: search, pagination, action buttons (Edit/Delete)
 */

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';

export default function DataTable({ columns = [], data = [], onEdit, onDelete, itemsPerPage = 10 }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => String(row[col.key] || '').toLowerCase().includes(q))
    );
  }, [data, search, columns]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
        <input type="text" placeholder="Cari data..." value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-300 bg-white text-sm text-charcoal-700 placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
      </div>
      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50 border-b border-cream-200">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">No</th>
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-6 py-3.5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">{col.label}</th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {pageData.length > 0 ? pageData.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-cream-50/50 transition-colors">
                  <td className="px-6 py-4 text-charcoal-400">{startIdx + i + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-charcoal-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && <button onClick={() => onEdit(row)} className="p-2 rounded-lg text-charcoal-400 hover:text-terracotta-500 hover:bg-terracotta-50 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>}
                        {onDelete && <button onClick={() => onDelete(row)} className="p-2 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-charcoal-400">{search ? 'Tidak ada data yang cocok' : 'Belum ada data'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-cream-200 bg-cream-50/50">
            <span className="text-xs text-charcoal-400">Menampilkan {startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredData.length)} dari {filteredData.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${i + 1 === currentPage ? 'bg-terracotta-500 text-white' : 'text-charcoal-500 hover:bg-cream-200'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
