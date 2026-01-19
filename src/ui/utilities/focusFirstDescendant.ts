function focusFirstDescendant({
  element,
  typeList,
}: {
  element: HTMLElement;
  typeList: string[];
}) {
  const firstElement = element.querySelector<HTMLElement>(
    typeList.join(', '),
  );
  firstElement?.focus();
}

export default focusFirstDescendant;
