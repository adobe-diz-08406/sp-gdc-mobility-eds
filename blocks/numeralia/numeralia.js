import { eyebrowDecorator } from '../../scripts/scripts.js';

function animateCounter(element, targetValue, duration = 2000) {
  const numberMatch = targetValue.match(/(\d+)/);
  if (!numberMatch) return;

  const targetNumber = parseInt(numberMatch[0], 10);
  const suffix = targetValue.replace(numberMatch[0], '');
  // Create wrapper structure
  const wrapper = document.createElement('span');
  wrapper.className = 'number-wrapper';
  const scrollContainer = document.createElement('span');
  scrollContainer.className = 'number-scroll';
  // Generate all numbers from 0 to target (in steps of 10)
  const numbers = [];
  for (let i = 0; i <= targetNumber; i += 10) {
    numbers.push(i);
  }
  // Add final number if it's not a multiple of 10
  if (targetNumber % 10 !== 0) {
    numbers.push(targetNumber);
  }
  // Create number elements
  numbers.forEach((num) => {
    const numEl = document.createElement('span');
    numEl.className = 'number-item';
    numEl.textContent = num.toString().padStart(2, '0');
    scrollContainer.appendChild(numEl);
  });
  wrapper.appendChild(scrollContainer);
  // Add suffix if it exists
  if (suffix) {
    const suffixEl = document.createElement('span');
    suffixEl.className = 'number-suffix';
    suffixEl.textContent = suffix;
    element.textContent = '';
    element.appendChild(wrapper);
    element.appendChild(suffixEl);
  } else {
    element.textContent = '';
    element.appendChild(wrapper);
  }
  // Animate
  const finalIndex = numbers.length - 1;
  const stepDuration = duration / finalIndex;
  let currentIndex = 0;
  function animateStep() {
    if (currentIndex <= finalIndex) {
      scrollContainer.style.transform = `translateY(-${currentIndex * 100}%)`;
      currentIndex += 1;
      if (currentIndex <= finalIndex) {
        setTimeout(animateStep, stepDuration);
      }
    }
  }
  setTimeout(animateStep, 100);
}

function observeStats(statsSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const numbers = entry.target.querySelectorAll('.number');
        numbers.forEach((numberEl) => {
          const targetValue = numberEl.getAttribute('data-target');
          if (targetValue && !numberEl.classList.contains('animated')) {
            numberEl.classList.add('animated');
            animateCounter(numberEl, targetValue);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

export default function decorate(block) {
  const children = [...block.children];
  if (children.length === 0) return;

  const headerSection = document.createElement('div');
  headerSection.className = 'header';
  const statsSection = document.createElement('div');
  statsSection.className = 'stats';

  children.forEach((child, index) => {
    if (index === 0) {
      child.className = 'title-wrapper';
      const [titleDiv, subtitleDiv] = child.children;
      if (titleDiv) {
        const eyebrow = eyebrowDecorator(titleDiv, 'accent-color');
        if (eyebrow) {
          titleDiv.replaceWith(eyebrow);
        }
      }
      if (subtitleDiv) subtitleDiv.className = 'subtitle';
      headerSection.appendChild(child);
    } else {
      child.className = 'stat-item';
      const [numberDiv, descriptionDiv] = child.children;
      if (numberDiv) {
        numberDiv.className = 'number';
        const originalValue = numberDiv.textContent.trim();
        numberDiv.setAttribute('data-target', originalValue);
        numberDiv.textContent = '0';
      }
      if (descriptionDiv) descriptionDiv.className = 'description';
      statsSection.appendChild(child);
    }
  });

  block.textContent = '';
  block.appendChild(headerSection);
  block.appendChild(statsSection);

  observeStats(statsSection);
}
