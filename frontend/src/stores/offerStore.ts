import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type OfferStatus = 'SENT' | 'OPENED' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface ProjectDetails {
  projectName: string;
  projectPeriodStart: string;
  projectPeriodEnd: string;
  requiredSkills: string[];
  projectDescription: string;
  location?: string;
  rateMin?: number;
  rateMax?: number;
  remarks?: string;
}

interface OfferStore {
  selectedEngineers: string[];
  filterStatus: OfferStatus[];
  projectDetails: ProjectDetails | null;
  
  toggleEngineer: (engineerId: string) => void;
  selectAllEngineers: (engineerIds: string[]) => void;
  clearSelection: () => void;
  setProjectDetails: (details: ProjectDetails) => void;
  clearProjectDetails: () => void;
  setFilterStatus: (status: OfferStatus[]) => void;
  toggleFilterStatus: (status: OfferStatus) => void;
  clearAllFilters: () => void;
}

export const useOfferStore = create<OfferStore>()(
  devtools(
    (set) => ({
      selectedEngineers: [],
      filterStatus: ['SENT', 'PENDING', 'OPENED'],
      projectDetails: null,
      
      toggleEngineer: (engineerId) => 
        set((state) => ({
          selectedEngineers: state.selectedEngineers.includes(engineerId)
            ? state.selectedEngineers.filter(id => id !== engineerId)
            : [...state.selectedEngineers, engineerId]
        }), false, 'toggleEngineer'),
        
      selectAllEngineers: (engineerIds) => 
        set({ selectedEngineers: engineerIds }, false, 'selectAllEngineers'),
        
      clearSelection: () => 
        set({ selectedEngineers: [] }, false, 'clearSelection'),
        
      setProjectDetails: (details) => 
        set({ projectDetails: details }, false, 'setProjectDetails'),
        
      clearProjectDetails: () => 
        set({ projectDetails: null }, false, 'clearProjectDetails'),
        
      setFilterStatus: (status) => 
        set({ filterStatus: status }, false, 'setFilterStatus'),
        
      toggleFilterStatus: (status) =>
        set((state) => ({
          filterStatus: state.filterStatus.includes(status)
            ? state.filterStatus.filter(s => s !== status)
            : [...state.filterStatus, status]
        }), false, 'toggleFilterStatus'),
        
      clearAllFilters: () =>
        set({ filterStatus: [] }, false, 'clearAllFilters'),
    }),
    {
      name: 'offer-store',
    }
  )
);