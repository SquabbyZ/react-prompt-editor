import React from 'react';
import { Link, useRouteMeta } from 'dumi';
import '../styles/site.css';

type HeroAction = {
  text: string;
  link: string;
};

function isExternalLink(link: string) {
  return /^(\w+:)\/\/|^(mailto|tel):/.test(link);
}

export default function Hero() {
  const { frontmatter } = useRouteMeta();

  if (!('hero' in frontmatter) || !frontmatter.hero) {
    return null;
  }

  const hero = frontmatter.hero as {
    title?: string;
    badge?: string;
    description?: string;
    note?: string;
    actions?: HeroAction[];
  };

  return (
    <section className="rpe-home-hero">
      <div className="rpe-home-hero-inner">
        {hero.badge ? <div className="rpe-home-hero-badge">{hero.badge}</div> : null}
        {hero.title ? (
          <h1 className="rpe-home-hero-title">
            <span>{hero.title}</span>
          </h1>
        ) : null}
        {hero.description ? (
          <p
            className="rpe-home-hero-description"
            dangerouslySetInnerHTML={{ __html: hero.description }}
          />
        ) : null}
        {hero.note ? <p className="rpe-home-hero-note">{hero.note}</p> : null}
        {hero.actions?.length ? (
          <div className="rpe-home-hero-actions">
            {hero.actions.map((action) =>
              isExternalLink(action.link) ? (
                <a
                  href={action.link}
                  key={action.text}
                  rel="noreferrer"
                  target="_blank"
                >
                  {action.text}
                </a>
              ) : (
                <Link key={action.text} to={action.link}>
                  {action.text}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
