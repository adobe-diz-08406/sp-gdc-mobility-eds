import { decorateIcons } from '../../scripts/aem.js';
import { eyebrowDecorator } from '../../scripts/scripts.js';

export default function decorate(block) {
  const isTwoCol = block.classList.contains('two-col');
  const isThreeCol = block.classList.contains('three-col');
  const isImageVariant = block.classList.contains('cards-image');

  if (!isTwoCol && !isThreeCol && !isImageVariant) return;

  // If authors applied background style (bg-dark / bg-grey) on the block,
  // move it up to the section so the entire section gets the background.
  const section = block.closest('.section');
  if (section) {
    ['bg-dark', 'bg-grey', 'bg-light','bg-accent'].forEach((bgClass) => {
      if (block.classList.contains(bgClass)) {
        block.classList.remove(bgClass);
        section.classList.add(bgClass);
      }
    });

    // If the first row contains eyebrow + title content, lift it out
    // into a default-content wrapper above the cards wrapper.
    if (!section.querySelector('.default-content-wrapper')) {
      const firstCol = block.firstElementChild;
      if (firstCol) {
        const hasHeading = firstCol.querySelector('h1, h2, h3, h4, h5, h6');
        if (hasHeading) {
          const eyebrowWrapper = document.createElement('div');
          eyebrowWrapper.className = 'default-content-wrapper';
          eyebrowWrapper.innerHTML = firstCol.innerHTML;

          const cardsWrapper = section.querySelector('.cards-wrapper');
          section.insertBefore(eyebrowWrapper, cardsWrapper || block);

          firstCol.remove();
        }
      }
    }
  }

  // Find and decorate eyebrow text in the default-content-wrapper
  if (section) {
    const defaultWrapper = section.querySelector('.default-content-wrapper');
    if (defaultWrapper) {
      const allParagraphs = defaultWrapper.querySelectorAll('p');
      let eyebrowElement = null;

      allParagraphs.forEach((p) => {
        if (!p.querySelector('picture') && !p.classList.contains('button-container')
          && !p.querySelector('strong') && !p.querySelector('em')
          && !p.classList.contains('eye-brow-text')) {
          const headingElement = defaultWrapper.querySelector('h1, h2, h3, h4, h5, h6');
          if (headingElement
            && p.compareDocumentPosition(headingElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
            eyebrowElement = p;
          }
        }
      });

      if (eyebrowElement) {
        const eyebrowText = eyebrowElement.textContent.trim();
        if (eyebrowText) {
          eyebrowElement.classList.add('eyebrow');
          const formattedEyebrow = eyebrowDecorator(eyebrowElement, 'accent-color');
          if (formattedEyebrow) {
            eyebrowElement.replaceWith(formattedEyebrow);
          }
        }
      }
    }
  }

  // Apply shared flex-grid helper classes for responsive layout
  block.classList.add('flex-grid', 'col-sm-1');
  if (isThreeCol) {
    block.classList.add('col-md-2', 'col-lg-3');
  } else if (isTwoCol) {
    block.classList.add('col-md-2', 'col-lg-2');
  }

  // Each remaining direct child div represents a card item
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

    // Image variant: use two images (default + hover), label, and optional description (on hover)
    if (isImageVariant) {
      const head = document.createElement('div');
      head.className = 'card-head';

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'card-image';

      const baseImageSource = cardCol.children[0]
        && cardCol.children[0].querySelector('img');
      const hoverImageSource = cardCol.children[1]
        && cardCol.children[1].querySelector('img');

      if (baseImageSource) {
        const baseImg = baseImageSource.cloneNode(true);
        baseImg.classList.add('card-image-default');
        imageWrapper.append(baseImg);
      }

      if (hoverImageSource) {
        const hoverImg = hoverImageSource.cloneNode(true);
        hoverImg.classList.add('card-image-hover');
        imageWrapper.append(hoverImg);
      }

      head.append(imageWrapper);

      const titleEl = document.createElement('h3');
      titleEl.className = 'card-title';
      const titleSource = copySource;
      const descriptionSource = cardCol.children[3];

      if (titleSource) {
        // Use inner <p> if present to avoid p-in-p
        let textSource = titleSource;
        const firstElement = titleSource.firstElementChild;
        if (firstElement && firstElement.tagName === 'P') {
          textSource = firstElement;
        }

        const textClone = textSource.cloneNode(true);

        // Remove any inner link markup; card itself is the link
        const innerLink = textClone.querySelector('a[href]');
        if (innerLink) {
          innerLink.replaceWith(...innerLink.childNodes);
        }

        titleEl.innerHTML = textClone.innerHTML;
      }

      head.append(titleEl);

      const body = document.createElement('div');
      body.className = 'card-body';

      if (descriptionSource) {
        // Use inner <p> if present to avoid p-in-p
        let descSource = descriptionSource;
        const firstDescElement = descriptionSource.firstElementChild;
        if (firstDescElement && firstDescElement.tagName === 'P') {
          descSource = firstDescElement;
        }

        const descClone = descSource.cloneNode(true);

        const innerDescLink = descClone.querySelector('a[href]');
        if (innerDescLink) {
          innerDescLink.replaceWith(...innerDescLink.childNodes);
        }

        const descParagraph = document.createElement('p');
        descParagraph.innerHTML = descClone.innerHTML;
        body.append(descParagraph);
      }

      item.append(head, body);
      items.push(item);
      return;
    }

    // Default cards variant with icon, title and body copy
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
     if (!isImageVariant) {
      decorateIcons(block);
    }
  } catch (e) {
    // ignore if decorateIcons not available yet
  }
}
