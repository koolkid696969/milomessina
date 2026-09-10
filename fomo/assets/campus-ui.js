document.querySelectorAll('.campus-sections').forEach(menu => {
  menu.addEventListener('click', event => {
    if (event.target.closest('a,button')) menu.open = false;
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
