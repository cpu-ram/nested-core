import focusFirstDescendant from './focusFirstDescendant';

const focusableTypes: string[] = ['input', 'button', 'textarea', 'a', 'details'];

function setTabFocus({
  element,
  focus,
}: {
  element: HTMLElement;
  focus: boolean;
}) {
  const focusableElementsArray = element.querySelectorAll<HTMLElement>(
    focusableTypes.join(', '),
  );

  focusableElementsArray.forEach((focusable) => {
    const prevTabIndex = focusable.getAttribute('data-prev-tabindex');
    const currentTabIndex = focusable.getAttribute('tabindex');

    if (focus) {
      if (prevTabIndex !== null) {
        focusable.setAttribute('tabindex', prevTabIndex);
        focusable.removeAttribute('data-prev-tabindex');
      } else {
        focusable.removeAttribute('tabindex');
      }
      focusFirstDescendant({ element, typeList: focusableTypes });
    } else if (!focus) {
      if (currentTabIndex !== null && !focusable.hasAttribute('data-prev-tabindex')) {
        focusable.setAttribute('data-prev-tabindex', currentTabIndex);
      }
      focusable.setAttribute('tabindex', '-1');
    }
  });
}

export default setTabFocus;
