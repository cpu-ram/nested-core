import { useRef } from 'react';

function useFocusStack() {
  const focusHistoryStackRef = useRef<HTMLElement[]>([]);

  function rememberFocus(): void {
    let currentActiveElement: HTMLElement | null = document.activeElement as HTMLElement | null;

    if (currentActiveElement) {
      let currentStack = focusHistoryStackRef.current;
      let lastActiveElement = currentStack[currentStack.length - 1];

      lastActiveElement?.classList.remove('last-active-element');

      currentStack.push(currentActiveElement);
      currentActiveElement.classList.add('last-active-element');
    }
  }

  function restoreFocus(): void {
    let currentStack = focusHistoryStackRef.current;
    let lastActiveElement = currentStack.pop();

    if (lastActiveElement) {
      lastActiveElement.focus();
      lastActiveElement.classList.remove('last-active-element');
    }

    if (currentStack.length > 0) {
      let newLastActiveElement = currentStack[currentStack.length - 1];
      newLastActiveElement.classList.add('last-active-element');
    }
  }

  function getLastActiveElement(): HTMLElement | null {
    let currentStack = focusHistoryStackRef.current;
    return currentStack[currentStack.length - 1] || null;
  }

  return { rememberFocus, restoreFocus };
}

export default useFocusStack;