import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/MachineList.css';
import { useNavigate } from 'react-router-dom';

interface Machine {
  id: number;
  name: string;
  alias: string | null;
}

interface ApiResponse {
  count: number;
  next: string | null;
  results: Machine[];
}

export const MachineList: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>('/api/machines/machines/');
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchedUrls = useRef<Set<string>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  const fetchMoreData = async (url: string) => {
    if (fetchedUrls.current.has(url)) return;
    
    setLoading(true);
    fetchedUrls.current.add(url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Błąd połączenia');
      
      const data: ApiResponse = await response.json();
      
      setMachines(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMachines = data.results.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNewMachines];
      });

      setNextUrl(data.next);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Błąd API:", error);
      fetchedUrls.current.delete(url);
    } finally {
      setLoading(false);
    }
  };

  const lastMachineElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextUrl) {
        fetchMoreData(nextUrl);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, nextUrl]);

  useEffect(() => {
    fetchMoreData('/api/machines/machines/');
  }, []);

  return (
    <div className="mch-wrapper">
      <div className="mch-header">
        <div>
          <h2 className="mch-title">Baza Maszyn</h2>
          <span className="mch-counter">
            Załadowano <strong>{machines.length}</strong> z <strong>{totalCount}</strong>
          </span>
        </div>
      </div>

      <div className="mch-table">
        <div className="mch-table-header">
          <div>ID</div>
          <div>Nazwa</div>
          <div>Alias</div>
          <div className="text-right">Akcje</div>
        </div>

        {machines.map((machine, index) => {
          const isLastElement = machines.length === index + 1;
          
          return (
            <div 
              key={machine.id}
              className="mch-row"
              ref={isLastElement ? lastMachineElementRef : null}
            >
              <div className="mch-id">#{machine.id}</div>
              <div className="mch-name">{machine.name}</div>
              <div className="mch-alias">
                {machine.alias || <span className="mch-alias-empty">brak aliasu</span>}
              </div>
              <div className="mch-actions">
                <button 
                  className="mch-btn btn-breakdown" 
                  onClick={() => navigate(`/ur/machines/${machine.id}/history`)}
                >
                  🚨 Awarie
                </button>
                <button className="mch-btn btn-analysis" onClick={() => console.log('Analiza', machine.id)}>📊 Analiza</button>
                <button className="mch-btn btn-notes" onClick={() => console.log('Notatki/Pliki', machine.id)}>📝 Notatki i Pliki</button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="loader">
            <div className="spinner"></div> Pobieranie maszyn...
          </div>
        )}
        
        {!nextUrl && machines.length > 0 && (
          <div className="mch-end-msg">Wszystkie maszyny zostały załadowane</div>
        )}
      </div>
    </div>
  );
};

export default MachineList;