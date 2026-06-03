import React from 'react';
import OriginalNotFound from 'dumi/theme-default/slots/NotFound';
import '../styles/site.css';

/**
 * 404 页面
 * 默认使用 dumi 内置 NotFound 页面。
 */
export default function NotFound() {
  return (
    <div className="rpe-site-not-found-wrap">
      <OriginalNotFound />
    </div>
  );
}
