import focusFirstDescendant from "./focusFirstDescendant";

let focusableTypes: string[] = ['input', 'button', 'textarea', 'a', 'details'];

function setTabFocus({
  element,
  focus,
}: {
  element: HTMLElement;
  focus: boolean;
}) {

  let focusableElementsArray = element.querySelectorAll<HTMLElement>(
    focusableTypes.join(', ')
  );

  focusableElementsArray.forEach((focusable) => {
    let prevTabIndex = focusable.getAttribute('data-prev-tabindex');
    let currentTabIndex = focusable.getAttribute('tabindex');

    if (focus) {
      if (prevTabIndex !== null) {
        focusable.setAttribute('tabindex', prevTabIndex);
        focusable.removeAttribute('data-prev-tabindex');
      }
      else {
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