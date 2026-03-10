export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  // The authored HTML is expected to be:
  // <div class="custom-table"><div><div><ul>...</ul></div>(<div>...</div>)</div></div>
  const cols = [...row.children].filter((el) => el.tagName === 'DIV');
  block.classList.add(`custom-table-${cols.length}-cols`);

  cols.forEach((col) => {
    col.classList.add('custom-table-col');
    const ul = col.querySelector('ul');
    if (ul) {
      ul.classList.add('custom-table-list');
      [...ul.children].forEach((li) => {
        if (li.tagName === 'LI') li.classList.add('custom-table-item');
      });
    }
  });
}

