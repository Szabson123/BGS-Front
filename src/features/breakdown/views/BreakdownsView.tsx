import React, { useEffect, useState } from 'react';
import { BreakdownTable } from '../components/BreakDownTable';
import { machinesApi } from '../api';
import { apiClient } from '../../../utils/apiClient';
import type { Breakdown } from '../types/breakdown';

const BreakdownsPage: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBreakdowns = () => {
    setLoading(true);
    machinesApi.getAllBreakDowns()
      .then(setBreakdowns)
      .catch((err) => console.error("Błąd pobierania danych:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBreakdowns();
  }, []);

  const handleStartStatus = async (breakdownId: number) => {
    try {
      await apiClient('/machines/move/break-down/', {
        method: 'POST',
        body: JSON.stringify({
          status: 'ST',
          break_down: breakdownId,
          description: ""
        })
      });
      fetchBreakdowns();
    } catch (error: any) {
      console.error("Błąd podczas rozpoczynania:", error.message || error);
    }
  };

  const handleEndStatus = async (
    breakdownId: number, 
    data: { description: string; typeId: number; responsibleId: number }
  ) => {
    try {
      await apiClient('/machines/end/break-down/', {
        method: 'POST',
        body: JSON.stringify({
          break_down: breakdownId,
          description: data.description,
          closing_break_down_type: data.typeId,
          responsible_for_breakdown: data.responsibleId
        })
      });
      fetchBreakdowns();
    } catch (error: any) {
      console.error("Błąd podczas kończenia:", error.message || error);
    }
  };

  return (
    <div>
      <BreakdownTable 
        data={breakdowns} 
        isLoading={loading} 
        onStartStatus={handleStartStatus} 
        onEndStatus={handleEndStatus}
      />
    </div>
  );
};

export default BreakdownsPage;