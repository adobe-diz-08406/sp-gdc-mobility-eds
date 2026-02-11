import { decorateIcons } from '../../scripts/aem.js';

export default function decorate(block) {
  // Handle two-col and three-col variants (same behavior as card.js)
  const isTwoCol = block.classList.contains('two-col');
  const isThreeCol = block.classList.contains('three-col');

  if (!isTwoCol && !isThreeCol) return;

  // If authors applied background style (bg-dark / bg-grey) on the block,
  // move it up to the section so the entire section gets the background.
  const section = block.closest('.section');
  if (section) {
    ['bg-dark', 'bg-grey'].forEach((bgClass) => {
      if (block.classList.contains(bgClass)) {
        block.classList.remove(bgClass);
        section.classList.add(bgClass);
      }
    });
  }

  // Apply shared flex-grid helper classes for responsive layout
  block.classList.add('flex-grid', 'col-sm-1');
  if (isThreeCol) {
    block.classList.add('col-md-2', 'col-lg-3');
  } else if (isTwoCol) {
    block.classList.add('col-md-2', 'col-lg-2');
  }

  // Each direct child div represents a card item
  const items = [];
  [...block.children].forEach((cardCol) => {
    const copySource = cardCol.children[2];

    // If author added a link in the copy cell, make the whole card clickable
    const linkEl = copySource && copySource.querySelector('a[href]');
    const isLinkCard = !!linkEl;

    const item = document.createElement(isLinkCard ? 'a' : 'div');
    item.className = 'card-item';

    if (isLinkCard) {
      const href = linkEl.getAttribute('href');
      if (href) {
        item.href = href;
      }

      const target = linkEl.getAttribute('target');
      if (target) {
        item.target = target;
      } else if (href && /^https?:\/\//.test(href)) {
        // Open external links in a new tab by default
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      } 

      const rel = linkEl.getAttribute('rel');
      if (rel) {
        item.rel = rel;
      }
    }

    const head = document.createElement('div');
    head.className = 'card-head';

    const body = document.createElement('div');
    body.className = 'card-body';

    // Icon (first)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'icon';
    const firstText = cardCol.children[0] && cardCol.children[0].textContent.trim();
    if (firstText && firstText.startsWith(':') && firstText.endsWith(':')) {
      const name = firstText.slice(1, -1);
      iconSpan.classList.add(`icon-${name}`);
    } else {
      iconSpan.innerHTML = cardCol.children[0] ? cardCol.children[0].innerHTML : '';
    }
    head.append(iconSpan);

    // Title (second)
    const titleEl = document.createElement('h3');
    titleEl.className = 'card-title';
    titleEl.innerHTML = cardCol.children[1] ? cardCol.children[1].innerHTML : '';
    head.append(titleEl);

    // Copy (third)
    if (copySource) {
      const arrow = copySource.querySelector('.icon-arrow');

      // Use inner <p> if present to avoid p-in-p
      let textSource = copySource;
      const firstElement = copySource.firstElementChild;
      if (firstElement && firstElement.tagName === 'P') {
        textSource = firstElement;
      }

      const textClone = textSource.cloneNode(true);
      const arrowInClone = textClone.querySelector('.icon-arrow');
      if (arrowInClone) arrowInClone.remove();

      // Remove any inner link markup; card itself is the link
      const innerLink = textClone.querySelector('a[href]');
      if (innerLink) {
        innerLink.replaceWith(...innerLink.childNodes);
      }

      const copyParagraph = document.createElement('p');
      copyParagraph.innerHTML = textClone.innerHTML;
      body.append(copyParagraph);

      if (arrow) {
        body.append(arrow);
      }
    }

    item.append(head, body);
    items.push(item);
  });

  // Replace block content with card items directly; layout is handled via flex-grid helpers
  block.replaceChildren(...items);

  // Let global decorator load/inject icons from /icons/
  try {
    decorateIcons(block);
  } catch (e) {
    // ignore if decorateIcons not available yet
  }
}
