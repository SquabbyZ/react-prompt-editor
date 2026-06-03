import React from 'react';
import OriginalHeader from 'dumi/theme-default/slots/Header';
import '../styles/site.css';

/**
 * 站点顶部导航
 * 默认使用 dumi 内置 Header 主题，可在此处覆盖 logo / navbar / 颜色模式等。
 */
export default function Header() {
  return (
    <div className="rpe-site-header-wrap">
      <OriginalHeader />
    </div>
  );
}
