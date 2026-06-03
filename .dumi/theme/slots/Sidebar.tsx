import React from 'react';
import OriginalSidebar from 'dumi/theme-default/slots/Sidebar';
import '../styles/site.css';

/**
 * 文档侧边栏
 * 默认使用 dumi 内置 Sidebar；如需自定义分组/图标，可在此处扩展。
 */
export default function Sidebar() {
  return (
    <aside className="rpe-site-sidebar-wrap">
      <OriginalSidebar />
    </aside>
  );
}
