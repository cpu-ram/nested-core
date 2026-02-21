import { useRef } from 'react';
import setTabFocus from './setTabFocus';
import focusFirstDescendant from './focusFirstDescendant';

function useLimitFocus() {
  const stackRef = useRef<HTMLElement[]>([]);

  function limitFocusToElement(elementToFocus: HTMLElement): void {
    let currentStack = stackRef.current;

    if (currentStack.length === 0) {
      const documentRoot = document.documentElement;
      currentStack.push(documentRoot);
    }

    for (let i = 0; i < currentStack.length; i++) {
      let selectedElement = currentStack[i];
      setTabFocus({ element: selectedElement, focus: false });
    }

    //let lastActiveElement = currentStack[currentStack.length - 1];
    //setTabFocus({ element: lastActiveElement, focus: false });

    currentStack.push(elementToFocus);
    setTabFocus({ element: elementToFocus, focus: true });
  }

  function restoreFocusable(): void {
    let currentStack = stackRef.current;

    if (currentStack.length <= 1) {
      return;
    }

    let currentlyFocusable = currentStack[currentStack.length - 1];
    let lastActiveElement = currentStack[currentStack.length - 2];

    setTabFocus({ element: currentlyFocusable, focus: false });
    currentStack.pop();

    for (let i = 0; i < currentStack.length - 1; i++) {
      let selectedElement = currentStack[i];
      setTabFocus({ element: selectedElement, focus: false });
    }

    setTabFocus({ element: lastActiveElement, focus: true });
  }

  return { limitFocusToElement, restoreFocusable };
}

export default useLimitFocus;