type Props = {
  html: string;
  className?: string;
};

export default function RichTextViewer({ html, className = "" }: Props) {
  return (
    <div
      className={`news-content leading-relaxed text-charcoal ${className}`}
      style={{ wordBreak: "keep-all" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
