import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  FolderOpen,
  Clock,
} from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

interface EntityTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchField?: (row: T) => string;
  filters?: FilterOption[];
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  actions?: React.ReactNode;
  lastUpdated?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
}

export function EntityTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  searchPlaceholder = 'Cari...',
  searchField,
  filters = [],
  onRefresh,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini setelah ditambahkan.',
  emptyAction,
  actions,
  lastUpdated,
  pageSize = 8,
  onRowClick,
}: EntityTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Check active filter chips
  const activeFilters = useMemo(() => {
    return filters.filter((f) => f.value && f.value !== 'ALL');
  }, [filters]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    filters.forEach((f) => f.onChange('ALL'));
    setCurrentPage(1);
  };

  // Filter & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((row) => {
        if (searchField) {
          return searchField(row).toLowerCase().includes(q);
        }
        return Object.values(row).some((val) => {
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(q);
          }
          return false;
        });
      });
    }

    return result;
  }, [data, debouncedSearch, searchField]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const isFilterActive = debouncedSearch.trim().length > 0 || activeFilters.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Controls: Search, Filters, Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#D8E5E2] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-[#60716D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-[#D8E5E2] hover:border-[#B4C9C5] focus:border-[#00201C] focus:ring-1 focus:ring-[#00201C] focus:outline-none placeholder-[#AAB8B4] text-black transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60716D] hover:text-black"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Select filters */}
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center">
              <select
                value={filter.value}
                onChange={(e) => {
                  filter.onChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-medium py-2 px-3 bg-[#F8FBFA] hover:bg-[#F0F5F4] text-black border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00201C]"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-[#60716D] hover:text-black hover:bg-[#F0F5F4] rounded-lg border border-[#D8E5E2] transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Action Buttons (e.g. + Tambah) */}
        {actions && <div className="flex items-center gap-2 self-end lg:self-auto">{actions}</div>}
      </div>

      {/* Active Filter Chips */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-[#60716D] flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter aktif:
          </span>

          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 bg-[#E1F5FE] text-[#1E5D75] border border-[#BDE3F5] text-xs px-2.5 py-1 rounded-md">
              <span>Pencarian: "{debouncedSearch}"</span>
              <button
                onClick={() => setSearchTerm('')}
                className="hover:text-black font-bold ml-1"
                aria-label="Hapus filter pencarian"
              >
                ×
              </button>
            </span>
          )}

          {activeFilters.map((f) => {
            const opt = f.options.find((o) => o.value === f.value);
            return (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 bg-[#E1F5FE] text-[#1E5D75] border border-[#BDE3F5] text-xs px-2.5 py-1 rounded-md"
              >
                <span>
                  {f.label}: {opt?.label || f.value}
                </span>
                <button
                  onClick={() => f.onChange('ALL')}
                  className="hover:text-black font-bold ml-1"
                  aria-label={`Hapus filter ${f.label}`}
                >
                  ×
                </button>
              </span>
            );
          })}

          <button
            onClick={resetAllFilters}
            className="text-xs font-semibold text-[#C84A4A] hover:underline ml-1 cursor-pointer"
          >
            Reset Semua
          </button>
        </div>
      )}

      {/* Main Table Surface */}
      <div className="bg-white rounded-xl border border-[#D8E5E2] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#00201C] text-white border-b border-[#00201C]">
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`px-4 py-3.5 text-xs font-semibold tracking-wider text-slate-100 uppercase ${
                        col.sortable ? 'cursor-pointer select-none hover:bg-[#002D27] transition-colors' : ''
                      } ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${
                        col.className || ''
                      }`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-300">
                            {isSorted ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8EFEB]">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skel-c-${cIdx}`} className="px-4 py-3.5">
                        <div className="h-4 bg-[#E2ECE9] rounded w-4/5" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                // Data Rows
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={keyExtractor(row)}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-[#F0F7F5] transition-colors ${
                      rowIdx % 2 === 1 ? 'bg-[#FAFCFB]' : 'bg-white'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-xs sm:text-sm text-black ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : isFilterActive ? (
                // Filter Empty State
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center bg-white">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-[#E1F5FE] flex items-center justify-center mb-3 text-[#397B94]">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-semibold text-black">Tidak ada hasil yang cocok</h4>
                      <p className="text-xs text-[#60716D] mt-1 mb-4 leading-relaxed">
                        Tidak ada data yang sesuai dengan kata kunci atau filter aktif Anda saat ini.
                      </p>
                      <Button variant="outline" size="sm" onClick={resetAllFilters}>
                        Reset Filter
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Generic Empty State
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center bg-white">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-[#F0F5F4] flex items-center justify-center mb-3 text-[#60716D]">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-semibold text-black">{emptyTitle}</h4>
                      <p className="text-xs text-[#60716D] mt-1 mb-4 leading-relaxed">{emptyDescription}</p>
                      {emptyAction && (
                        <Button variant="primary" size="sm" onClick={emptyAction.onClick}>
                          {emptyAction.label}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination & Last Updated */}
        <div className="px-4 py-3 border-t border-[#D8E5E2] bg-[#F8FBFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#60716D]">
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="flex items-center gap-1 text-[11px] text-[#7A8B87]">
                <Clock className="w-3 h-3" /> Terakhir diperbarui: {lastUpdated}
              </span>
            )}
            <span>
              Menampilkan{' '}
              <strong className="text-black">
                {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </strong>{' '}
              -{' '}
              <strong className="text-black">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{' '}
              dari <strong className="text-black">{sortedData.length}</strong> entri
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-md border border-[#D8E5E2] bg-white hover:bg-[#F0F5F4] disabled:opacity-30 disabled:cursor-not-allowed text-black transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-medium bg-white border border-[#D8E5E2] rounded-md text-black">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-1.5 rounded-md border border-[#D8E5E2] bg-white hover:bg-[#F0F5F4] disabled:opacity-30 disabled:cursor-not-allowed text-black transition-colors"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
