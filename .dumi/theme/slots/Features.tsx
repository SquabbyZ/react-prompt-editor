import React from 'react';
import { Link, useRouteMeta } from 'dumi';
import '../styles/site.css';

type FeatureItem = {
  title?: string;
  description?: string;
  emoji?: string;
  link?: string;
};

function isExternalLink(link: string) {
  return /^(\w+:)\/\/|^(mailto|tel):/.test(link);
}

export default function Features() {
  const { frontmatter } = useRouteMeta();
  const items = (frontmatter.features || []) as FeatureItem[];

  if (!items.length) {
    return null;
  }

  return (
    <section className="rpe-home-features">
      <div className="rpe-home-features-header">
        <span className="rpe-home-features-eyebrow">
          {frontmatter.featuresEyebrow || 'Core capabilities'}
        </span>
        <h2 className="rpe-home-features-title">
          {frontmatter.featuresTitle || 'Built for structured prompt engineering'}
        </h2>
        {frontmatter.featuresDescription ? (
          <p
            className="rpe-home-features-description"
            dangerouslySetInnerHTML={{ __html: String(frontmatter.featuresDescription) }}
          />
        ) : null}
      </div>
      <div className="rpe-home-features-grid">
        {items.map((item) => {
          const title = item.title || '';
          const description = item.description || '';
          const content = (
            <>
              {item.emoji ? (
                <div className="rpe-home-features-card-icon" aria-hidden="true">
                  {item.emoji}
                </div>
              ) : null}
              {title ? <h3>{title}</h3> : null}
              {description ? <p dangerouslySetInnerHTML={{ __html: description }} /> : null}
            </>
          );

          if (!item.link) {
            return (
              <article className="rpe-home-features-card" key={title || description}>
                {content}
              </article>
            );
          }

          return (
            <article className="rpe-home-features-card" key={title || description}>
              {isExternalLink(item.link) ? (
                <a href={item.link} rel="noreferrer" target="_blank">
                  {content}
                </a>
              ) : (
                <Link to={item.link}>{content}</Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
