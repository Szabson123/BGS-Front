export interface User {
  id: number;
  first_name: string;
  last_name: string;
  number: string | null;
}

export interface Machine {
  id: number;
  name: string;
  alias: string;
}

export interface LatestStatus {
  status: string;
  user: User;
  description: string | null;
  time?: string | null;
}

export interface Breakdown {
  id: number;
  machine: Machine;
  date_added: string;
  priority: 'LOW' | 'MID' | 'HIGH' | 'NONE';
  reporter: User;
  description: string;
  latest_status: LatestStatus;
}