import React, { useState } from 'react';
import type { Breakdown } from '../types/breakdown';
import { apiClient } from '../../../utils/apiClient';
import '../styles/BreakDownTable.css';

export interface HelperItem {
  id: number;
  name: string;
}

interface BreakdownTableProps {
  data: Breakdown[];
  isLoading: boolean;
  onStartStatus: (breakdownId: number) => void;
  onEndStatus: (breakdownId: number, data: { description: string; typeId: number; responsibleId: number }) => void;
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'HIGH': return { label: 'Wysoki', class: 'bd-prio-wysoki' };
    case 'MID': return { label: 'Średni', class: 'bd-prio-sredni' };
    case 'LOW': return { label: 'Niski', class: 'bd-prio-niski' };
    default: return { label: 'Brak', class: 'bd-prio-brak' };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'RP': return { label: 'Oczekujące', color: 'var(--bd-status-rp-color)', class: 'bd-status-rp-badge' };
    case 'ST': return { label: 'W naprawie', color: 'var(--bd-status-st-color)', class: 'bd-status-st-badge' };
    case 'ED': return { label: 'Zakończone', color: 'var(--bd-status-ed-color)', class: 'bd-status-ed-badge' };
    default: return { label: 'Nieznany', color: 'var(--bd-border-color)', class: 'bd-status-default-badge' };
  }
};

const calculateDuration = (startDateStr: string, status: string, endDateStr?: string | null) => {
  const start = new Date(startDateStr).getTime();
  const end = (status === 'ED' && endDateStr) ? new Date(endDateStr).getTime() : new Date().getTime();
  
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

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ 
  data, isLoading, onStartStatus, onEndStatus 
}) => {
  
  const [modalState, setModalState] = useState<{ 
    isOpen: boolean; 
    breakdownId: number | null;
    actionType: 'start' | 'end' | null;
  }>({
    isOpen: false,
    breakdownId: null,
    actionType: null,
  });

  const [typesHelper, setTypesHelper] = useState<HelperItem[]>([]);
  const [responsiblesHelper, setResponsiblesHelper] = useState<HelperItem[]>([]);
  const [isLoadingHelpers, setIsLoadingHelpers] = useState(false);

  const [endForm, setEndForm] = useState({
    description: '',
    typeId: '',
    responsibleId: ''
  });

  const handleOpenModal = async (id: number, type: 'start' | 'end') => {
    setEndForm({ description: '', typeId: '', responsibleId: '' });
    
    setModalState({ isOpen: true, breakdownId: id, actionType: type });

    if (type === 'end') {
      setIsLoadingHelpers(true);
      try {
        const [typesData, responsiblesData] = await Promise.all([
          apiClient('/machines/move/break-down/types/helper/'),
          apiClient('/machines/move/break-down/responsible/helper/')
        ]);
        
        setTypesHelper(typesData as HelperItem[]);
        setResponsiblesHelper(responsiblesData as HelperItem[]);
      } catch (error) {
        console.error("Błąd pobierania danych do formularza:", error);
      } finally {
        setIsLoadingHelpers(false);
      }
    }
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalState.breakdownId) return;

    if (modalState.actionType === 'start') {
      onStartStatus(modalState.breakdownId);
      handleCloseModal();
    } else if (modalState.actionType === 'end') {
      onEndStatus(modalState.breakdownId, {
        description: endForm.description,
        typeId: Number(endForm.typeId),
        responsibleId: Number(endForm.responsibleId)
      });
      handleCloseModal();
    }
  };

  if (isLoading) return <div style={{ padding: '20px' }}>Ładowanie danych...</div>;

  return (
    <div className="bd-wrapper">
      <div className="bd-container">
        <h2 className="bd-header-title">Aktywne Zgłoszenia UR</h2>
        
        <div className="bd-ticket-list">
          <div className="bd-ticket-header">
            <div>Identyfikator maszyny</div>
            <div>Zgłoszono</div>
            <div>Priorytet</div>
            <div>Zgłaszający</div>
            <div>Opis usterki</div>
            <div>Status</div>
            <div>Uwagi z naprawy</div>
            <div>Rozpoczęcie</div> 
            <div>Interwencja</div>
            <div>Czas trwania</div>
            <div>Akcja</div>
          </div>

          {data.map((item) => {
            const prio = getPriorityConfig(item.priority);
            const status = getStatusConfig(item.latest_status.status);

            const dateAddedObj = new Date(item.created_at);
            const addedDate = dateAddedObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const addedTime = dateAddedObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

            const statusDateObj = item.latest_status.created_at ? new Date(item.latest_status.created_at) : null;
            const statusDate = statusDateObj 
              ? statusDateObj.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
              : '-';
            const statusTimeStr = statusDateObj 
              ? statusDateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) 
              : '';

            const reporterName = item.reporter.first_name 
              ? `${item.reporter.first_name} ${item.reporter.last_name}`.trim() 
              : 'System';
            const changerName = item.latest_status.status === 'RP'
              ? '-'
              : (item.latest_status.user?.first_name 
                  ? `${item.latest_status.user.first_name} ${item.latest_status.user.last_name}`.trim()
                  : 'System_Auto');

            const statusDescription = item.latest_status.description || '-';
            const durationStr = calculateDuration(item.created_at, item.latest_status.status, item.latest_status.created_at);

            return (
              <div key={item.id} className="bd-ticket-card" style={{ borderLeftColor: status.color }}>
                <div className="bd-machine-info">
                  <div className="bd-machine-name">{item.machine.name}</div>
                  {item.machine.alias && (
                    <div className="bd-machine-alias">({item.machine.alias})</div>
                  )}
                </div>
                
                <div className="bd-time">
                  <div>{addedDate}</div>
                  <div className="bd-time-hour">{addedTime}</div>
                </div>
                
                <div>
                  <span className={`bd-badge ${prio.class}`}>{prio.label}</span>
                </div>
                
                <div className="bd-person">{reporterName}</div>
                
                <div className="bd-description" title={item.description}>
                  {item.description}
                </div>
                
                <div>
                  <span className={`bd-badge ${status.class}`}>{status.label}</span>
                </div>
                
                <div className="bd-description" title={statusDescription}>
                  {statusDescription}
                </div>
                
                <div className="bd-time">
                  <div>{statusDate}</div>
                  {statusTimeStr && <div className="bd-time-hour">{statusTimeStr}</div>}
                </div>
                
                <div className="bd-person">{changerName}</div>
                
                <div className="bd-duration">
                  {durationStr}
                </div>
                
                <div className="bd-actions">
                  {item.latest_status.status === 'RP' && (
                    <button 
                      className="bd-btn bd-btn-start"
                      onClick={() => handleOpenModal(item.id, 'start')}
                    >
                      Rozpocznij
                    </button>
                  )}

                  {item.latest_status.status === 'ST' && (
                    <button 
                      className="bd-btn bd-btn-end"
                      onClick={() => handleOpenModal(item.id, 'end')}
                    >
                      Zakończ
                    </button>
                  )}

                  {item.latest_status.status === 'ED' && (
                    <span className="bd-person" style={{ color: 'var(--bd-text-muted)' }}>
                      Brak akcji
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div 
        className={`bd-modal-overlay ${modalState.isOpen ? 'bd-modal-open' : ''}`} 
        onClick={handleCloseModal}
      >
        <div className="bd-modal-content" onClick={(e) => e.stopPropagation()}>
          
          {modalState.actionType === 'start' && (
            <>
              <h3 className="bd-modal-title">Potwierdzenie</h3>
              <p className="bd-modal-text">Czy na pewno chcesz rozpocząć naprawę?</p>
              <div className="bd-modal-actions">
                <button type="button" className="bd-modal-btn bd-modal-btn-cancel" onClick={handleCloseModal}>
                  Anuluj
                </button>
                <button type="button" className="bd-modal-btn bd-modal-btn-confirm" onClick={() => handleConfirmAction()}>
                  Rozpocznij
                </button>
              </div>
            </>
          )}

          {modalState.actionType === 'end' && (
            <>
              <h3 className="bd-modal-title">Zakończenie Naprawy</h3>
              
              {isLoadingHelpers ? (
                <div style={{ padding: '30px 0', color: '#666' }}>
                  ⏳ Pobieranie danych do formularza...
                </div>
              ) : (
                <form onSubmit={handleConfirmAction}>
                  <p className="bd-modal-text" style={{marginBottom: '15px'}}>
                    Wypełnij poniższe dane, aby zamknąć zgłoszenie.
                  </p>
                  
                  <div className="bd-form-group">
                    <label>Typ awarii</label>
                    <select 
                      required
                      className="bd-form-control"
                      value={endForm.typeId}
                      onChange={e => setEndForm({...endForm, typeId: e.target.value})}
                    >
                      <option value="" disabled>Wybierz typ...</option>
                      {typesHelper.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bd-form-group">
                    <label>Odpowiedzialny</label>
                    <select 
                      required
                      className="bd-form-control"
                      value={endForm.responsibleId}
                      onChange={e => setEndForm({...endForm, responsibleId: e.target.value})}
                    >
                      <option value="" disabled>Wybierz osobę...</option>
                      {responsiblesHelper.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bd-form-group">
                    <label>Uwagi / Opis</label>
                    <textarea 
                      required
                      rows={3}
                      className="bd-form-control"
                      placeholder="Opisz wykonane prace..."
                      value={endForm.description}
                      onChange={e => setEndForm({...endForm, description: e.target.value})}
                    />
                  </div>

                  <div className="bd-modal-actions" style={{marginTop: '25px'}}>
                    <button type="button" className="bd-modal-btn bd-modal-btn-cancel" onClick={handleCloseModal}>
                      Anuluj
                    </button>
                    <button type="submit" className="bd-modal-btn bd-modal-btn-confirm">
                      Zakończ
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};