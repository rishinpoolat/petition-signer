export interface PetitionStats {
  id: string;
  title: string;
  content: string;
  status: 'open' | 'closed';
  signature_count: number;
  signature_threshold: number;
  created_at: string;
  response?: string;
}

export interface DashboardStats {
  totalPetitions: number;
  openPetitions: number;
  closedPetitions: number;
  totalSignatures: number;
  petitions: PetitionStats[];
}