import React, { useState, useEffect, useMemo } from 'react';
import '../styles/CreateBreakdown.css';
import { apiClient } from '../../../utils/apiClient';

interface MachineHelper {
  id: number;
  name: string;
  alias: string | null;
}

export const CreateBreakdown: React.FC = () => {
  const [machines, setMachines] = useState<MachineHelper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedMachine, setSelectedMachine] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/machines/create/break-down/machine-list/helper/')
      .then(res => res.json())
      .then(data => setMachines(data))
      .catch(err => console.error("Błąd helpera:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMachines = useMemo(() => {
    return machines.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.alias && m.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, machines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine || !description) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiClient('/machines/create/break-down/', {
        method: 'POST',
        body: JSON.stringify({
          machine: selectedMachine,
          priority: "NONE",
          description: description
        })
      });

      setMessage({ type: 'success', text: 'Zgłoszenie zostało wysłane!' });
      setDescription('');
      setSelectedMachine('');
      setSearchTerm('');
      
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Wystąpił błąd podczas wysyłania.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cb-wrapper">
      <div className="cb-card">
        <h2 className="cb-title">🚨 Nowe Zgłoszenie Awarii</h2>
        
        {message && (
          <div className={`cb-alert cb-alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cb-form">
          <div className="cb-group">
            <label>Wybierz Maszynę</label>
            <input 
              type="text" 
              placeholder="🔍 Szukaj maszyny (nazwa lub alias)..." 
              className="cb-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="cb-custom-listbox">
              {loading ? (
                <div className="cb-listbox-item disabled">⏳ Ładowanie listy...</div>
              ) : filteredMachines.length > 0 ? (
                filteredMachines.map(m => (
                  <div 
                    key={m.id} 
                    className={`cb-listbox-item ${selectedMachine === m.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMachine(m.id)}
                  >
                    <span className="mch-name">{m.name}</span> 
                    {m.alias && <span className="mch-alias"> ({m.alias})</span>}
                  </div>
                ))
              ) : (
                <div className="cb-listbox-item disabled">❌ Nie znaleziono maszyny</div>
              )}
            </div>
          </div>

          <div className="cb-group">
            <label>Opis usterki</label>
            <textarea 
              rows={4} 
              placeholder="Opisz co się stało..."
              className="cb-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="cb-submit-btn" 
            disabled={isSubmitting || !selectedMachine}
          >
            {isSubmitting ? 'Wysyłanie...' : 'Zgłoś Awarię'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBreakdown;