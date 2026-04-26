import React, { useEffect, useState } from 'react';
import { machinesApi } from '../api';
import type { Breakdown } from '../types/breakdown';
import { ReviewCalendar } from '../components/ReviewCalendar';

const CalendarPage: React.FC = () => {
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    machinesApi.getAllBreakDowns()
      .then(setBreakdowns)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <ReviewCalendar data={breakdowns} isLoading={loading} />
    </div>
  );
};

export default CalendarPage;