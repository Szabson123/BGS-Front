import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MachineHistory from './MachineHistory';

const MachineHistoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id || isNaN(Number(id))) {
    return <div style={{ padding: '20px' }}>Nieprawidłowe ID maszyny.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '0 20px' }}>
        <button 
          onClick={() => navigate('/ur/machines')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#475569'
          }}
        >
          ← Wróć do listy maszyn
        </button>
      </div>

      <MachineHistory machineId={Number(id)} />
    </div>
  );
};

export default MachineHistoryView;