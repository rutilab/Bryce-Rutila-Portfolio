import type { ReactNode } from 'react';

/**
 * The card at the top of a folder page that says what the folder is: a row of
 * labelled facts, a rule, then the description.
 *
 * One component so every folder opens onto the same shape. A folder with no
 * facts to state — personal work has no company or role — drops the row and the
 * rule with it rather than showing empty columns.
 */

export type FolderFact = { label: string; value: string };

export function FolderIntro({
  facts = [],
  eyebrow,
  children,
}: {
  /** Company, role, timeline — whichever of them apply. */
  facts?: FolderFact[];
  /** Stands in for the fact row when there is none. */
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="folder-page-intro">
      {facts.length > 0 && (
        <>
          <div className="folder-intro-facts">
            {facts.map(fact => (
              <div key={fact.label} className="folder-intro-fact">
                <div className="folder-intro-fact-label">{fact.label}</div>
                <div className="folder-intro-fact-value">{fact.value}</div>
              </div>
            ))}
          </div>
          <div className="folder-intro-rule" />
        </>
      )}

      {facts.length === 0 && eyebrow && <div className="folder-page-eyebrow">{eyebrow}</div>}

      <p className="folder-page-blurb">{children}</p>
    </div>
  );
}
