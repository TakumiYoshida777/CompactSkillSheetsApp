import { useState, useMemo } from 'react';
import type { Engineer, OfferStatus } from '@/types/offer';

interface FilterState {
  statusFilter: OfferStatus | 'all';
  skillFilter: string;
  availabilityFilter: string;
  sortField: string;
  sortOrder: 'ascend' | 'descend';
}

interface UseOfferFiltersReturn {
  filters: FilterState;
  setStatusFilter: (status: OfferStatus | 'all') => void;
  setSkillFilter: (skill: string) => void;
  setAvailabilityFilter: (availability: string) => void;
  setSortField: (field: string) => void;
  setSortOrder: (order: 'ascend' | 'descend') => void;
  applyFilters: (engineers: Engineer[]) => Engineer[];
  handleTableChange: (pagination: any, filters: any, sorter: any) => void;
}

/**
 * オファーボードのフィルタリング・ソート機能を提供するカスタムフック
 */
export const useOfferFilters = (): UseOfferFiltersReturn => {
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('ascend');

  const applyFilters = useMemo(() => {
    return (engineers: Engineer[]): Engineer[] => {
      if (!engineers) return [];

      let filtered = [...engineers];

      // ステータスフィルター
      if (statusFilter !== 'all') {
        filtered = filtered.filter(e => e.offerStatus === statusFilter);
      }

      // スキルフィルター
      if (skillFilter) {
        filtered = filtered.filter(e =>
          e.skills.some(skill =>
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          )
        );
      }

      // 稼働可能時期フィルター
      if (availabilityFilter !== 'all') {
        filtered = filtered.filter(e => {
          if (availabilityFilter === 'immediate') {
            return e.availability === '即日';
          } else if (availabilityFilter === 'within2weeks') {
            return e.availability === '即日' || e.availability === '2週間後';
          } else if (availabilityFilter === 'within1month') {
            return e.availability !== '1ヶ月以上';
          }
          return true;
        });
      }

      // ソート処理
      if (sortField) {
        filtered.sort((a, b) => {
          let compareResult = 0;
          switch (sortField) {
            case 'name':
              compareResult = a.name.localeCompare(b.name);
              break;
            case 'experience':
              compareResult = a.experience - b.experience;
              break;
            case 'hourlyRate':
              compareResult = (a.hourlyRate || 0) - (b.hourlyRate || 0);
              break;
            default:
              break;
          }
          return sortOrder === 'ascend' ? compareResult : -compareResult;
        });
      }

      return filtered;
    };
  }, [statusFilter, skillFilter, availabilityFilter, sortField, sortOrder]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || 'ascend');
    }
  };

  return {
    filters: {
      statusFilter,
      skillFilter,
      availabilityFilter,
      sortField,
      sortOrder,
    },
    setStatusFilter,
    setSkillFilter,
    setAvailabilityFilter,
    setSortField,
    setSortOrder,
    applyFilters,
    handleTableChange,
  };
};