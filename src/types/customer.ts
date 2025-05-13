
export interface Customer {
  id: number;
  user: string;
  ticket_id: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved';
  feedback?: number;
}
