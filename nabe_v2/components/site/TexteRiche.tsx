export default function TexteRiche({
  html,
  className,
  as = 'div',
}: {
  html: string;
  className?: string;
  as?: 'div' | 'span';
}) {
  const Balise = as;
  return <Balise className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
