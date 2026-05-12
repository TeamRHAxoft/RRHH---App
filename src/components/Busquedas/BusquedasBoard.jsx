import { useState } from 'react'
import SearchList from './SearchList'
import ReportesView from './ReportesView'
import { Search, BarChart2 } from 'lucide-react'

const SUB_TABS = [
  { id: 'externas', label: 'Búsquedas Externas', icon: Search },
  { id: 'internas', label: 'Búsquedas Internas', icon: Search },
  { id: 'reportes', label: 'Reportes', icon: BarChart2 },
]

export default function BusquedasBoard() {
  const [activeTab, setActiveTab] = useState('externas')

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'externas' && <SearchList type="externa" />}
      {activeTab === 'internas' && <SearchList type="interna" />}
      {activeTab === 'reportes' && <ReportesView />}
    </div>
  )
}
