/** Honest early-build overlay, with working repository links instead of unfinished tools. */
import { appConfig } from '../config/app.config';
import { strings } from '../config/strings.en';
import { buildLabel } from '../core/build';
import { element, link } from './shared/dom';

export function createShell(root: HTMLElement, revision: string) {
  const skip = link(strings.skip, '#build-status', 'skip-link');
  const water = element('div', 'water');
  water.setAttribute('aria-hidden', 'true');
  const canvasHost = element('div', 'canvas-host');
  water.append(canvasHost, element('div', 'water-light'), element('div', 'water-grain'));

  const header = element('header', 'masthead');
  const identity = element('div', 'identity');
  identity.append(
    element('span', 'wordmark', strings.brand),
    element('span', 'brand-detail', strings.brandDetail),
  );
  const stage = element('div', 'stage');
  stage.append(
    element('span', 'small-label', strings.stage),
    element('span', 'phase-label', strings.phase),
  );
  header.append(identity, stage);

  const main = element('main', 'intro');
  main.append(element('p', 'eyebrow', strings.eyebrow));
  const heading = element('h1', 'hero-title');
  const firstLine = element('span', 'title-line', strings.heading[0]);
  const secondLine = element('span', 'title-line', strings.heading[1]);
  secondLine.append(element('em', 'ink-word', strings.heading[2]));
  heading.append(firstLine, secondLine);
  main.append(heading, element('p', 'description', strings.description));

  const chapter = element('section', 'chapter');
  chapter.id = 'build-status';
  chapter.tabIndex = -1;
  chapter.setAttribute('aria-labelledby', 'chapter-title');
  const number = element('p', 'small-label', strings.chapterNumber);
  const chapterTitle = element('h2', 'chapter-title', strings.chapterTitle);
  chapterTitle.id = 'chapter-title';
  const chapterBody = element('div', 'chapter-body');
  chapterBody.append(chapterTitle, element('p', 'chapter-description', strings.chapterDescription));
  const runtime = element('div', 'runtime');
  const status = element('p', 'renderer-status', strings.rendererStarting);
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const build = element('span', 'build-id', `${strings.revisionPrefix} ${buildLabel(revision)}`);
  runtime.append(element('p', 'small-label', strings.liveLabel), status, build);
  chapter.append(number, chapterBody, runtime);

  const footer = element('footer', 'footer');
  const footerCopy = element('div', 'footer-copy');
  footerCopy.append(
    element('p', 'small-label', strings.footer),
    element('p', 'privacy-note', strings.privacy),
  );
  const links = element('nav', 'links');
  links.setAttribute('aria-label', strings.stage);
  links.append(
    link(strings.source, appConfig.repository),
    link(strings.plan, `${appConfig.repository}/blob/${appConfig.branch}/IMPLEMENTATION_PLAN.md`),
  );
  footer.append(footerCopy, links);
  root.replaceChildren(skip, water, header, main, chapter, footer);

  return { canvasHost, status };
}
