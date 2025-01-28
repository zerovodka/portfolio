export const HtmlPreview = ({
  html,
  style,
}: {
  html: string;
  style: string;
}) => {
  return (
    <NoticeDOM
      dangerouslySetInnerHTML={{
        __html: [html].join(' '),
      }}
      className={PreviewNoticeContentWrap({ fileType: 'file' })}
    />
  );
};
