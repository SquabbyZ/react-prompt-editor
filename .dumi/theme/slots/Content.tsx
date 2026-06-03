import React from 'react';
import { useRouteMeta } from 'dumi';
import OriginalContent from 'dumi/theme-original/slots/Content';
import '../styles/site.css';

type ContentProps = React.PropsWithChildren;

export default function Content(props: ContentProps) {
  const { frontmatter } = useRouteMeta();
  const className = ['rpe-doc-page', frontmatter.hero ? 'rpe-doc-page-home' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <OriginalContent>
      <div className={className}>{props.children}</div>
    </OriginalContent>
  );
}
