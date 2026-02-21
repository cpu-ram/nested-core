import tabbableTypes from './tabbableTypes';

function focusFirstDescendant({
  element,
}: {
  element: HTMLElement;
}) {
  const firstElement = element.querySelector<HTMLElement>(
    tabbableTypes.join(', '),
  );
  firstElement?.focus();
}

export default focusFirstDescendant;
