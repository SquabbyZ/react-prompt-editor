import React from 'react';
import OriginalContentFooter from 'dumi/theme-default/slots/ContentFooter';
import '../styles/site.css';

/**
 * 内容区底部（编辑链接 / 上一篇 / 下一篇）
 * 默认使用 dumi 内置 ContentFooter。
 */
export default function ContentFooter() {
  return (
    <div className="rpe-site-content-footer-wrap">
      <OriginalContentFooter />
    </div>
  );
}
