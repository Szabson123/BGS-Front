import React, { useEffect, useState } from 'react';
import '../styles/MachineHistory.css'

interface User {
  id: number;
  first_name: string;
  last_name: string;
  number: string | null;
}

interface HistoryItem {
  status: 'RP' | 'ST' | 'ED';
  user: User;
  description: string | null;
  time: string;
}

interface Breakdown {
  id: number;
  date_added: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  reporter: User;
  description: string;
  history: HistoryItem[];
}

interface MachineHistoryData {
  id: number;
  breakdowns: Breakdown[];
}

interface MachineHistoryProps {
  machineId: number;
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'HIGH': return { label: 'Wysoki', class: 'mh-prio-wysoki' };
    case 'MEDIUM': return { label: 'Średni', class: 'mh-prio-sredni' };
    case 'LOW': return { label: 'Niski', class: 'mh-prio-niski' };
    default: return { label: 'Brak', class: 'mh-prio-brak' };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'RP': return { label: 'Zgłoszona (RP)', class: 'mh-status-rp', dotClass: 'mh-dot-rp' };
    case 'ST': return { label: 'W trakcie (ST)', class: 'mh-status-st', dotClass: 'mh-dot-st' };
    case 'ED': return { label: 'Zakończona (ED)', class: 'mh-status-ed', dotClass: 'mh-dot-ed' };
    default: return { label: 'Nieznany', class: 'mh-status-default', dotClass: 'mh-dot-default' };
  }
};

const formatUserName = (user: User) => {
  if (user.first_name || user.last_name) {
    return `${user.first_name} ${user.last_name}`.trim();
  }
  return `Użytkownik #${user.id}`;
};

export const MachineHistory: React.FC<MachineHistoryProps> = ({ machineId }) => {
  const [data, setData] = useState<MachineHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/machines/machines/${machineId}/machine_full_history/`);
        if (!response.ok) throw new Error('Błąd podczas pobierania historii maszyny');
        
        const jsonData: MachineHistoryData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd');
      } finally {
        setLoading(false);
      }
    };

    if (machineId) {
      fetchHistory();
    }
  }, [machineId]);

  if (loading) return <div className="mh-loader">Ładowanie historii maszyny...</div>;
  if (error) return <div className="mh-error">Błąd: {error}</div>;
  if (!data) return null;

  return (
    <div className="mh-wrapper">
      <div className="mh-container">
        <h2 className="mh-header-title">
          Historia Maszyny #{data.id} <span className="mh-subtitle">Dziennik awarii i napraw</span>
        </h2>

        <div className="mh-list">
          {/* Nagłówek Tabeli/Listy */}
          <div className="mh-list-header">
            <div>ID</div>
            <div>Zgłoszono</div>
            <div>Priorytet</div>
            <div>Aktualny Status</div>
            <div></div>
          </div>

          {/* Renderowanie poszczególnych awarii */}
          {data.breakdowns.length === 0 && (
            <div className="mh-empty">Brak historii awarii dla tej maszyny.</div>
          )}

          {data.breakdowns.map((breakdown, index) => {
            const prio = getPriorityConfig(breakdown.priority);
            // Historia wraca od najnowszej do najstarszej (indeks 0 to aktualny status)
            const currentStatusItem = breakdown.history[0];
            const status = getStatusConfig(currentStatusItem ? currentStatusItem.status : 'UNKNOWN');
            
            const addedDateObj = new Date(breakdown.date_added);
            const addedDate = addedDateObj.toLocaleDateString('pl-PL');
            const addedTime = addedDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            return (
              <details key={breakdown.id} className="mh-item" open={index === 0}>
                {/* Wiersz z podsumowaniem (Summary) */}
                <summary className="mh-item-summary">
                  <div className="mh-col-id">#{breakdown.id}</div>
                  <div className="mh-col-date">
                    {addedDate} <span className="mh-time-muted">{addedTime}</span>
                  </div>
                  <div>
                    <span className={`mh-badge ${prio.class}`}>{prio.label}</span>
                  </div>
                  <div>
                    <span className={`mh-status-pill ${status.class}`}>{status.label}</span>
                  </div>
                  <div className="mh-col-action">
                    <span className="mh-toggle-icon"></span>
                  </div>
                </summary>

                {/* Rozwinięte szczegóły */}
                <div className="mh-item-details">
                  
                  {/* Główny opis zgłoszenia */}
                  <div className="mh-main-info">
                    <div className="mh-info-header">
                      <strong>Zgłaszający:</strong> {formatUserName(breakdown.reporter)}
                    </div>
                    <div className="mh-long-description">
                      <strong>Opis problemu:</strong><br/>
                      {breakdown.description || <em className="mh-text-muted">Brak opisu</em>}
                    </div>
                  </div>

                  {/* Dziennik zdarzeń (Oś czasu) */}
                  <div className="mh-history-log">
                    <h4>Przebieg prac (Statusy)</h4>
                    <div className="mh-timeline">
                      {breakdown.history.map((histItem, hIndex) => {
                        const histStatus = getStatusConfig(histItem.status);
                        const histDateObj = new Date(histItem.time);
                        const hDate = histDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });
                        const hTime = histDateObj.toLocaleTimeString('pl-PL');

                        return (
                          <div key={hIndex} className="mh-timeline-item">
                            <div className={`mh-timeline-dot ${histStatus.dotClass}`}></div>
                            <div className="mh-timeline-content">
                              <div className="mh-timeline-meta">
                                <span className="mh-hist-status">{histStatus.label}</span>
                                <span className="mh-hist-time">{hDate}, {hTime}</span>
                                <span className="mh-hist-user">{formatUserName(histItem.user)}</span>
                              </div>
                              
                              {/* Jeśli jest opis (np. komentarz z naprawy), wyświetlamy go */}
                              {histItem.description ? (
                                <div className="mh-hist-desc">{histItem.description}</div>
                              ) : (
                                <div className="mh-hist-empty">Brak uwag przy zmianie statusu.</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MachineHistory;