import React from 'react';
import OriginalToc from 'dumi/theme-default/slots/Toc';
import '../styles/site.css';

/**
 * 文档右侧目录
 * 默认使用 dumi 内置 Toc（Table of Contents）。
 */
export default function Toc() {
  return (
    <div className="rpe-site-toc-wrap">
      <OriginalToc />
    </div>
  );
}
