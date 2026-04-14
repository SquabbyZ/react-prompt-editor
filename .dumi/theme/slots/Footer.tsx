import React from 'react';
import { Link, useIntl, useLocale, useSiteData } from 'dumi';
import '../styles/site.css';

function localeBasePath(locale: ReturnType<typeof useLocale>) {
  return 'base' in locale ? locale.base : '/';
}

export default function Footer() {
  const intl = useIntl();
  const locale = useLocale();
  const { themeConfig } = useSiteData();
  const base = localeBasePath(locale);
  const isEn = intl.locale === 'en-US';
  const githubLink = themeConfig.socialLinks?.github;
  const footerMeta = String(themeConfig.footer || '').trim();

  return (
    <footer className="rpe-site-footer">
      <div className="rpe-site-footer-brand">
        <strong>{themeConfig.name || 'RPEditor'}</strong>
        <span>
          {isEn
            ? 'A prompt engineering workspace for structured authoring, execution and AI optimization.'
            : '面向结构化 Prompt 编排、执行与 AI 优化的工程化工作台。'}
        </span>
      </div>
      <div className="rpe-site-footer-aside">
        <div className="rpe-site-footer-links">
          <Link to={base}>{isEn ? 'Home' : '首页'}</Link>
          <Link to={`${base}components/prompt-editor`}>
            {isEn ? 'Docs' : '组件文档'}
          </Link>
          <Link to={`${base}i18n`}>{isEn ? 'i18n' : '国际化'}</Link>
          {githubLink ? (
            <a href={githubLink} rel="noreferrer" target="_blank">
              GitHub
            </a>
          ) : null}
        </div>
        {footerMeta ? (
          <div className="rpe-site-footer-meta">
            <span>{footerMeta}</span>
          </div>
        ) : null}
      </div>
      {githubLink ? (
        <a
          className="rpe-site-footer-signoff"
          href={githubLink}
          rel="noreferrer"
          target="_blank"
        >
          {isEn ? 'Built by SquabbyZ' : '由 SquabbyZ 构建'}
        </a>
      ) : null}
    </footer>
  );
}
