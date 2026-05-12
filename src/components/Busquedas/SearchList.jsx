import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import SearchCard from './SearchCard'
import AddSearchModal from './AddSearchModal'
import { Plus, FolderOpen } from 'lucide-react'

export default function SearchList({ type }) {
  const [searches, setSearches] = useState([])
  const [candidates, setCandidates] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('searches-candidates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'searches' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [type])

  const fetchData = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('searches').select('*').eq('type', type).or('status.eq.activa,status.is.null').order('created_at', { ascending: false }),
      supabase.from('candidates').select('*').order('created_at', { ascending: true }),
    ])
    setSearches(s || [])
    setCandidates(c || [])
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{searches.length} búsquedas activas</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva búsqueda
        </button>
      </div>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No hay búsquedas {type === 'externa' ? 'externas' : 'internas'} todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {searches.map((search) => (
            <SearchCard
              key={search.id}
              search={search}
              candidates={candidates.filter((c) => c.search_id === search.id)}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddSearchModal
          type={type}
          onClose={() => setShowAddModal(false)}
          onAdded={fetchData}
        />
      )}
    </div>
  )
}
