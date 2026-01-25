import { useState, useEffect, type ReactNode, Fragment } from 'react';
import { useImmer } from 'use-immer';
import clsx from 'clsx';
import type { Action } from './types/action';
import { BaseNode } from '../node/BaseNode';

import setTabFocus from './utilities/setTabFocus';

import type TreeUIProps from './TreeUIProps';
import type { FilterCriteriaState } from './types/filterCriterion';
import FilterMenu from './components/FilterMenu';

function TreeUI(props: TreeUIProps) {
  const {
    dataTree,
    renderCustomDataFields,
    renderTitle,
    isFilteredOut,
    actions,
    getNodeActionsList,
    headerActions,
    initialFilterCriteria,
    nodeSort,
  } = props;
  const [filterCriteria, updateFilterCriteria] = useImmer<FilterCriteriaState>(
    initialFilterCriteria.reduce<FilterCriteriaState>(
      (acc, curr) => ({
        ...acc,
        [curr.name]: { label: curr.label, value: curr.initialValue },
      }),
      {},
    ),
  );
  const [popupContent, setPopupContent] = useState<ReactNode>(null);
  const [lastActiveElement, setLastActiveElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (popupContent !== null) {
      const primary = document.getElementById('primary');
      const secondary = document.getElementById('secondary');

      if (primary && secondary) {
        setTabFocus({ element: primary, focus: false });
        setTabFocus({ element: secondary, focus: true });
      }
    }
    if (popupContent === null) {
      const primary = document.getElementById('primary');
      const secondary = document.getElementById('secondary');

      primary && setTabFocus({ element: primary, focus: true });
      secondary && setTabFocus({ element: secondary, focus: false });

      if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement.classList.remove('last-active-element');
      }
      setLastActiveElement(null);
    }
  }, [popupContent]);

  const mainClassNames = clsx(popupContent && 'split-screen');

  function showPopup({ content }: { content: ReactNode }) {
    if (popupContent !== null) {
      throw new Error(
        'Error: Can not display new popup, popup content is already shown.',
      );
    }

    let currentActiveElement: HTMLElement | null = null;

    if (document.activeElement) {
      currentActiveElement = document.activeElement as HTMLElement;
      currentActiveElement.classList.add('last-active-element');
    }

    if (currentActiveElement) setLastActiveElement(currentActiveElement);

    setPopupContent(content);
  }

  function hidePopup() {
    setPopupContent(null);
  }

  const createToggleHandler = (criterionName: string) => () => {
    updateFilterCriteria((x: Record<string, { value: boolean }>) => {
      const targetCriterion = x[criterionName];
      if (!targetCriterion) throw new Error(`Invalid filter criterion name: ${criterionName}`);
      targetCriterion.value = !targetCriterion.value;
    });
  };

  function renderNodeActions(node: BaseNode): ReactNode[] {
    return getNodeActionsList(node).map((actionName: string) => {
      const targetAction = actions[actionName];
      if (!targetAction) throw new Error(`Invalid filter criterion name: ${actionName}`);
      const action: Action = targetAction;
      return renderActionButton(action, node);
    });
  }

  function HeaderActions(): ReactNode[] {
    return headerActions.map((actionName: string) => {
      const targetAction = actions[actionName];
      if (!targetAction) throw new Error(`Invalid filter criterion name: ${actionName}`);

      const action: Action = targetAction;
      return (
        <Fragment key={actionName}>
          {renderActionButton(action)}
        </Fragment>
      );
    });
  }

  function renderActionButton(
    action: Action,
    callerNode?: BaseNode,
  ): ReactNode {
    if (!action.ownRenderer) {
      return (
        <button
          type="button"
          key={action.label}
          onClick={() => runAction(action, {
            callerId: callerNode?.id,
          })}
        >
          {action.label}
        </button>
      );
    }
    return (
      action.ownRenderer()
    );
  }

  function runAction(
    action: Action,
    context: {
      callerId?: string | undefined;
    },
  ) {
    if (action.type === 'node') {
      if (!context.callerId) {
        throw new Error('Error: node action requires callerId in context.');
      }

      action.execute?.({ callerId: context.callerId });

      action.renderer
        && showPopup({
          content: action.renderer({ hidePopup, callerId: context.callerId }),
        });
    } else if (action.type === 'global') {
      action.execute?.();

      action.renderer
        && showPopup({
          content: action.renderer({ hidePopup }),
        });
    } else {
      throw new Error('Error: unsupported action type.');
    }
  }

  function renderNode(
    node: BaseNode,
    filterCriteria: FilterCriteriaState,
    nodeSort: (a: BaseNode, b: BaseNode) => number,
  ): ReactNode | null {
    if (isFilteredOut(node, filterCriteria)) {
      return null;
    }
    return (
      <details className="content" key={node.id}>
        <summary>{renderTitle(node)}</summary>

        <div className="details-body">
          {renderCustomDataFields(node)}
          {node.body && <p>{node.body}</p>}

          {node.children?.length > 0
            && [...node.children]
              .sort(nodeSort)
              .map((child) => renderNode(child, filterCriteria, nodeSort))}

          <span className="node-actions">{renderNodeActions(node)}</span>
        </div>
      </details>
    );
  }

  return (
    <>
      <header>
        <nav>
          <HeaderActions />
        </nav>
      </header>
      <main className={mainClassNames}>
        <section id="primary">
          <FilterMenu
            filterCriteria={filterCriteria}
            createToggleHandler={createToggleHandler}
          />
          {renderNode(dataTree, filterCriteria, nodeSort)}
        </section>

        <section
          role="region"
          id="secondary"
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape' && popupContent !== null) {
              hidePopup();
            }
          }}
        >
          {popupContent}
        </section>
      </main>
    </>
  );
}

export default TreeUI;
