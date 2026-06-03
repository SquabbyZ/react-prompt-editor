import React from 'react';
import '../styles/site.css';

/**
 * 路由切换 Loading 占位
 * 简化的内联骨架屏，避免依赖链问题。
 */
const Loading: React.FC = () => {
  return (
    <div className="rpe-site-loading-skeleton">
      <div className="rpe-site-loading-line rpe-site-loading-line-first" />
      <div className="rpe-site-loading-line" />
      <div className="rpe-site-loading-line" />
      <div className="rpe-site-loading-line rpe-site-loading-line-short" />
    </div>
  );
};

export default Loading;
