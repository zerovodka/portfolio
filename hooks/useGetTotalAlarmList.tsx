import { useInfiniteQuery } from '@tanstack/react-query';
import { getTotalAlarmList } from '@admin/api/hooks/Alarm/getTotalAlarmList';
import { useAtom } from 'jotai';
import { dialogAtom } from '@gubgoo-backoffice/design-system';
import { useMemo } from 'react';
import { environment } from '@admin/environments/environment';

/**
 * @description [QUERY] 전체 알림 리스트 가져오기
 * @param lastId
 * @returns
 */
export const useGetTotalAlarmList = ({ lastId }: { lastId: string | null }) => {
  const isProd = environment.production;

  const [modal] = useAtom(dialogAtom);

  const isAlarmModalOpen = useMemo(() => {
    return modal.dialogs.find(
      (item) => item.containerType === 'floating-modal' && item.title === '알림'
    );
  }, [modal.dialogs]);

  return useInfiniteQuery({
    queryKey: ['totalAlarm'],
    queryFn: () =>
      getTotalAlarmList({
        lastId,
      }),
    // enabled: false,
    getNextPageParam: (lastPage, pages) => lastPage,
    getPreviousPageParam: (prevPage, pages) => null,
    // 3초 폴링링
    refetchInterval(data, query) {
      if (isAlarmModalOpen || !isProd) {
        return false;
      }
      return 3000;
    },
  });
};
