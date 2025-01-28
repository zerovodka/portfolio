import queryString from 'query-string';
import { useCallback, useRef } from 'react';
import {
  ParamKeyValuePair,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { shallowEqual } from 'fast-equals';

export const useQueryString = <T, U = { [K in keyof T]: string }>(): {
  queryString: U;
  navigateQueryString: (obj: U) => void;
  deleteQueryString: (obj: string[]) => void;
  navigateSendData: (obj: U) => void;
} => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const _queryString = queryString.parse(search);
  const prevQueryString = useRef<U>();

  const isEqual = shallowEqual(_queryString, prevQueryString.current);
  if (!prevQueryString.current || !isEqual) {
    prevQueryString.current = _queryString as U;
  }

  const navigateQs = useCallback(
    (obj: U) => {
      const defaultQs = queryString.parse(search);

      setSearchParams({
        ...defaultQs,
        ...(obj as ParamKeyValuePair[]),
      });
    },
    [search, setSearchParams]
  );

  const deleteQs = useCallback(
    (obj: string[]) => {
      const excludeQs = queryString.exclude(window.location.href, obj);
      const splitExcludeQsByQuestionMark = excludeQs.split('?');
      const getOnlyQueryStringFromExcludeQs =
        splitExcludeQsByQuestionMark.length > 1
          ? `?${splitExcludeQsByQuestionMark[1]}`
          : null;
      const parsingExcludeQs = getOnlyQueryStringFromExcludeQs
        ? queryString.parse(getOnlyQueryStringFromExcludeQs)
        : {};

      setSearchParams({
        ...parsingExcludeQs,
        ...({} as ParamKeyValuePair[]),
      });
    },
    [search]
  );

  const navigateData = useCallback(
    (obj: U) => {
      const defaultUrl = `${pathname}${search}`;

      navigate(defaultUrl, {
        state: obj,
      });
    },
    [navigate, pathname, search]
  );

  return {
    queryString: prevQueryString.current,
    navigateQueryString: (obj: U) => {
      navigateQs(obj);
    },
    deleteQueryString: (obj: string[]) => {
      deleteQs(obj);
    },
    navigateSendData: (obj: U) => {
      navigateData(obj);
    },
  };
};
