import { useState, useLayoutEffect, useRef } from 'react';
import './moreActionsMenuStyles.css';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton } from '@mui/material';

function MoreActionsMenu(
  props: {
    actionsRendered: React.ReactNode[];
    limitFocusToElement: (elementToFocus: HTMLElement) => void;
    restoreFocusable: () => void;
    rememberFocus: () => void;
    restoreFocus: () => void;
  }
) {
  let menuRef = useRef<HTMLElement | null>(null);

  let { limitFocusToElement, restoreFocusable, rememberFocus, restoreFocus } = props;

  let [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    if (isExpanded) {
      rememberFocus();
      limitFocusToElement(menuRef.current);
    }
    else {
      restoreFocusable();
      restoreFocus();
    }
  }, [isExpanded])

  return (
    <div className="more-actions-menu-container">
      <button onClick={
        () => {
          setIsExpanded((prev) => !prev);
        }
      } size="small">
        <MoreHorizIcon />
      </button>
      {isExpanded &&
        <div
          className="more-actions-menu"
          ref={menuRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape') {
              setIsExpanded(false);
            }
          }}
        >
          {props.actionsRendered}
        </div>
      }
    </div>
  );
}


export default MoreActionsMenu;
