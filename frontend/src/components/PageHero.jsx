function PageHero({ badge, title, subtitle, children }) {
  return (
    <header className="page-hero">
      {badge && <span className="page-hero-badge">{badge}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </header>
  );
}

export default PageHero;
