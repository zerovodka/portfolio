import { fonts } from '@gubgoo-backoffice/css';
import {
  FileInputButtonStyle,
  SpanText,
  useTopToastOpen,
} from '@gubgoo-backoffice/design-system';
import { ClipIcon } from '@gubgoo-backoffice/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NoticeFromType,
  NoticeValue,
} from '@admin/pages/notice/side-panel-content/NoticeWrite';
import { NoticeFileTextStyle } from '@admin/pages/notice/notice.css';

export const ImageHtmlRegister = ({
  register,
  errors,
  setValue,
  getValues,
  watch,
  editInfo,
}: Omit<NoticeFromType, 'setFocus'> & {
  editInfo?: Omit<NoticeValue, 'file' | 'uploadFile'>;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState('');
  const [fileType, setFileType] = useState('');
  const [edit, setEdit] = useState<'none' | 'change' | undefined>(
    getValues('editHTML')
  );
  const { open: toastOpen } = useTopToastOpen();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const file = e.target.files[0];

        // 아래 확장명 외에는 첨부 못하게 요청받음
        if (
          file.type !== 'image/png' &&
          file.type !== 'image/jpg' &&
          file.type !== 'image/jpeg' &&
          file.type !== 'image/gif' &&
          file.type !== 'text/html'
        ) {
          return toastOpen({
            type: 'fail',
            title: '파일 첨부 실패',
            content: '형식에 맞지 않는 파일입니다.',
          });
        }

        const reader = new FileReader();
        // 첨부한 파일명을 미리보여주기 위한 작업
        setPreview(e.target.files[0].name);
        setFileType(file.type.split('/')[1]);
        setValue('file', file);

        if (!file) {
          return;
        }

        // 1. html인 경우 미리보기 화면으로 넘기는 value값을 HTML로 설정
        if (file.type === 'text/html') {
          const pureHTML = await file.text();
          setValue('uploadFile', pureHTML);
        } else {
          // 2. 그 외에는 FileReader
          reader.readAsDataURL(file);

          reader.onloadend = () => {
            setValue('uploadFile', reader.result as string);
          };
        }
      }
      e.target.value = '';
    },
    []
  );

  const { ref } = register('file');

  // 파일 미리보기 UI에 대한 제어 필요요
  const setEditPreview = useCallback(() => {
    if (editInfo && editInfo.editFile.includes('html')) {
      setPreview(`${editInfo.noticeTitle}.html`);
    }

    if (editInfo && !editInfo.editFile.includes('html')) {
      const extensionNameArr = editInfo.editFile.split('.');
      const extensionName = extensionNameArr[extensionNameArr.length - 1];
      setPreview(`${editInfo.noticeTitle}.${extensionName}`);
    }
  }, [editInfo?.editFile, editInfo?.noticeTitle]);

  useEffect(() => {
    setEditPreview();
  }, [setEditPreview]);

  // React-hook-form 에서 watch를 사용할 때 unsubscribe를 통해 렌더링 최적화를 하도록 공식 문서에서 권장하고있음
  useEffect(() => {
    const subscribe = watch((data, { name }) => {
      setEdit(data.editHTML);
    });

    return () => subscribe.unsubscribe();
  }, [watch]);

  return (
    <>
      <button
        type="button"
        className={FileInputButtonStyle({ disabled: edit === 'none' })}
        style={{
          width: '18.75rem',
          justifyContent: 'space-between',
        }}
        onClick={() => {
          inputRef.current?.click();
        }}
        data-filetype={fileType}
        disabled={edit === 'none'}
      >
        <SpanText
          text={preview ? preview : '선택된 파일 없음'}
          font={fonts.body3}
          className={NoticeFileTextStyle}
        />
        <ClipIcon />
      </button>
      <input
        type="file"
        accept="image/png, image/jpg, image/jpeg, image/gif, text/html"
        id="noticeFile"
        ref={(e) => {
          ref(e);
          inputRef.current = e;
        }}
        onChange={async (e) => {
          await handleFileChange(e);
        }}
        style={{
          display: 'none',
        }}
      />
    </>
  );
};
