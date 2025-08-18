import { useQuery } from '@tanstack/react-query';
import { offerApi } from '@/api/client/offerApi';
import type { OfferBoardData } from '@/types/offer';

export const useOfferBoard = () => {
  return useQuery<OfferBoardData>({
    queryKey: ['offerBoard'],
    queryFn: () => offerApi.getOfferBoard(),
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    cacheTime: 1000 * 60 * 10, // 10分間キャッシュを保持
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};