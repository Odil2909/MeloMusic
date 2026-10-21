interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  aside?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  aside,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      {aside ? <span className="section-aside">{aside}</span> : null}
    </div>
  );
}
