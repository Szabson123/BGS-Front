import React, { useEffect, useState } from 'react';
import { BreakdownTable } from '../components/BreakDownTable';
import { machinesApi } from '../api';
import type { Breakdown } from '../types/breakdown';

const BreakdownsPage: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    machinesApi.getAllBreakDowns()
      .then(setBreakdowns)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <BreakdownTable data={breakdowns} isLoading={loading} />
    </div>
  );
};

export default BreakdownsPage;