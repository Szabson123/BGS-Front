import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/BreakdownRaport.css';
import { BreakdownPdfGenerator } from './BreakdownPdfGenerator';

interface MachineHelper {
  id: number;
  name: string;
  alias: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface HistoryItem {
  status: string;
  user: User;
  description: string | null;
  created_at: string;
}

interface Breakdown {
  id: number;
  machine: { id: number; name: string; alias: string | null };
  created_at: string;
  priority: string;
  reporter: User;
  description: string;
  history: HistoryItem[];
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Breakdown[];
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'HIGH': return { label: 'Wysoki', class: 'ar-prio-wysoki' };
    case 'MID': return { label: 'Średni', class: 'ar-prio-sredni' };
    case 'LOW': return { label: 'Niski', class: 'ar-prio-niski' };
    default: return { label: 'Brak', class: 'ar-prio-brak' };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'RP': return { label: 'Oczekujące', class: 'ar-status-rp-badge' };
    case 'ST': return { label: 'W naprawie', class: 'ar-status-st-badge' };
    case 'ED': return { label: 'Zakończone', class: 'ar-status-ed-badge' };
    default: return { label: 'Nieznany', class: 'ar-status-default-badge' };
  }
};

const calculateDuration = (startStr: string, endStr?: string) => {
  const start = new Date(startStr).getTime();
  const end = endStr ? new Date(endStr).getTime() : new Date().getTime();
  const diffMs = end - start;
  
  if (diffMs < 0) return '-';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const mins = diffMins % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const BreakdownRaport: React.FC = () => {
  const [items, setItems] = useState<Breakdown[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stan dla listy maszyn z helpera
  const [machines, setMachines] = useState<MachineHelper[]>([]);

  const [filters, setFilters] = useState({
    search: '', 
    status: '', 
    priority: '', 
    date_after: '', 
    date_before: '',
    machine: '' // Dodany klucz do filtrów
  });

  const observer = useRef<IntersectionObserver | null>(null);

  // Pobieranie listy maszyn (helper)
  const fetchMachinesHelper = async () => {
    try {
      const response = await fetch('/api/machines/create/break-down/machine-list/helper/');
      if (response.ok) {
        const data = await response.json();
        setMachines(data);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania listy maszyn:", err);
    }
  };

  const fetchBreakdowns = async (currentPage: number, currentFilters: typeof filters, resetItems = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.priority) params.append('priority', currentFilters.priority);
      if (currentFilters.date_after) params.append('date_range_after', currentFilters.date_after);
      if (currentFilters.date_before) params.append('date_range_before', currentFilters.date_before);
      // Dodanie parametru machine do zapytania
      if (currentFilters.machine) params.append('machine', currentFilters.machine);

      const response = await fetch(`/api/machines/all-break-downs-to-report/?${params.toString()}`);
      if (!response.ok) throw new Error('Błąd podczas pobierania danych');
      
      const data: ApiResponse = await response.json();

      setItems(prev => resetItems ? data.results : [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (err) {
      setError('Nie udało się załadować listy usterek.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Pobierz maszyny raz przy montowaniu komponentu
  useEffect(() => {
    fetchMachinesHelper();
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchBreakdowns(1, filters, true);
  }, [filters]);

  useEffect(() => {
    if (page > 1) fetchBreakdowns(page, filters, false);
  }, [page]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="ar-wrapper">
      <div className="ar-container">
        
        <h2 className="ar-header-title">Raport Zgłoszeń UR</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input type="text" name="search" placeholder="Szukaj..." value={filters.search} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--ar-border-color)' }} />
          
          {/* NOWY FILTR: Maszyny */}
          <select name="machine" value={filters.machine} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--ar-border-color)', maxWidth: '200px' }}>
            <option value="">Wszystkie maszyny</option>
            {machines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} {m.alias ? `(${m.alias})` : ''}
              </option>
            ))}
          </select>

          <select name="status" value={filters.status} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--ar-border-color)' }}>
            <option value="">Statusy (Wszystkie)</option>
            <option value="RP">Oczekujące</option>
            <option value="ST">W naprawie</option>
            <option value="ED">Zakończone</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--ar-border-color)' }}>
            <option value="">Priorytety (Wszystkie)</option>
            <option value="HIGH">Wysoki</option>
            <option value="MID">Średni</option>
            <option value="LOW">Niski</option>
            <option value="NONE">Brak</option>
          </select>
          <BreakdownPdfGenerator filters={filters} />
        </div>

        <div className="ar-ticket-list">
          <div className="ar-ticket-header">
            <div>Maszyna / Alias</div>
            <div className="ar-centered">Zgłoszono</div>
            <div className="ar-centered">Priorytet</div>
            <div>Zgłaszający</div>
            <div>Opis usterki</div>
            <div className="ar-centered">Status</div>
            <div>Opis z naprawy</div>
            <div>Opis końcowy</div>
            <div className="ar-centered">Rozpoczęto</div>
            <div>Kto zamknął</div>
            <div>Interweniował</div>
            <div>Trwało</div>
          </div>

          {items.map((item, index) => {
            const history = item.history || [];
            const latest = history[0];
            const started = history.find(h => h.status === 'ST');
            const ended = history.find(h => h.status === 'ED');

            const prio = getPriorityConfig(item.priority);
            const status = latest ? getStatusConfig(latest.status) : getStatusConfig('RP');

            const reporterName = item.reporter ? `${item.reporter.first_name} ${item.reporter.last_name}`.trim() : 'System';
            const closerName = ended ? `${ended.user.first_name} ${ended.user.last_name}`.trim() : '-';
            const intervenorName = started ? `${started.user.first_name} ${started.user.last_name}`.trim() : (latest ? `${latest.user.first_name} ${latest.user.last_name}`.trim() : '-');

            const isLastElement = items.length === index + 1;

            const addedDateObj = new Date(item.created_at);
            const addedDate = addedDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const addedTime = addedDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            const startedDateObj = started ? new Date(started.created_at) : null;
            const startedDate = startedDateObj ? startedDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
            const startedTime = startedDateObj ? startedDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div 
                key={item.id} 
                className="ar-ticket-card" 
                ref={isLastElement ? lastElementRef : null}
              >
                <div className="ar-machine-info">
                  <div className="ar-machine-name">{item.machine.name}</div>
                  {item.machine.alias && (
                    <div style={{ color: 'var(--ar-text-muted)', fontSize: '0.85em', marginTop: '2px' }}>
                      {item.machine.alias}
                    </div>
                  )}
                </div>
                
                <div className="ar-time ar-centered">
                  <div>{addedDate}</div>
                  <div style={{ fontSize: '0.9em', color: 'var(--ar-text-muted)' }}>{addedTime}</div>
                </div>
                
                <div className="ar-centered">
                  <span className={`ar-badge ${prio.class}`}>{prio.label}</span>
                </div>
                
                <div className="ar-person">{reporterName}</div>
                
                <div className="ar-description">{item.description}</div>
                
                <div className="ar-centered">
                  <span className={`ar-badge ${status.class}`}>{status.label}</span>
                </div>
                
                <div className="ar-description">{started?.description || '-'}</div>
                <div className="ar-description">{ended?.description || '-'}</div>
                
                <div className="ar-time ar-centered">
                  <div>{startedDate}</div>
                  {startedTime && <div style={{ fontSize: '0.9em', color: 'var(--ar-text-muted)' }}>{startedTime}</div>}
                </div>
                
                <div className="ar-person">{closerName}</div>
                <div className="ar-person">{intervenorName}</div>
                
                <div className="ar-duration">{calculateDuration(item.created_at, ended?.created_at)}</div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ar-text-muted)' }}>
          {isLoading && <span>Pobieranie danych...</span>}
          {!hasMore && items.length > 0 && !error && <span>Koniec danych.</span>}
          {!isLoading && items.length === 0 && !error && <span>Brak zgłoszeń.</span>}
          {error && (
            <div style={{ color: 'var(--ar-status-rp-color)' }}>
              {error}
              <button onClick={() => { setHasMore(true); fetchBreakdowns(page, filters, false); }} style={{ marginLeft: '10px' }}>Ponów</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BreakdownRaport;