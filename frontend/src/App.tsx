import { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { immerable } from 'immer';
import { ReactNode } from 'react';
import './App.css';
import JsonView from '@uiw/react-json-view';
import { BaseNode } from '../../shared/types/node/BaseNode.ts';
import { Task } from '../../shared/types/task/Task.ts';
import { Domain } from '../../shared/types/domain/Domain.ts';
import { Temporal } from 'temporal-polyfill';
import { getData, exportData } from './data/getData.ts';

import Header from './components/Header/Header.tsx';
import CreateTask from './components/CreateTask/CreateTask.tsx';
import CreateDomain from './components/CreateTask/CreateDomain.tsx';
import clsx from 'clsx';
import setTabFocus from './utilities/setTabFocus.ts';
import { create } from 'domain';

BaseNode.prototype[immerable] = true;

function App() {
  const [tree, updateTree] = useImmer<BaseNode>(getData());
  const [filterCriteria, updateFilterCriteria] = useImmer<{
    [criterion: string]: boolean;
  }>({});
  const [popupContent, setPopupContent] = useState<ReactNode>(null);
  const [lastActiveElement, setLastActiveElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    localStorage.setItem('taskData', JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    if (popupContent !== null) {
      let primary = document.getElementById('primary');
      let secondary = document.getElementById('secondary');

      if (primary && secondary) {
        setTabFocus({ element: primary, focus: false });
        setTabFocus({ element: secondary, focus: true });
      }
    }

    else if (popupContent === null) {
      let primary = document.getElementById('primary');
      let secondary = document.getElementById('secondary');

      for (let el of [primary, secondary]) {
        if (el) setTabFocus({ element: el, focus: true });
      }

      if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement.classList.remove('last-active-element');
      }
      setLastActiveElement(null);
    }
  }, [popupContent]);

  const data = getData({ testMode: false });

  type NodeType = 'Task' | 'Domain';

  let mainClassNames = clsx(
    popupContent && 'split-screen',
  );

  function downloadData(): void {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskData.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function showPopup({ content }: { content: ReactNode }) {
    if (popupContent !== null) throw new Error('Error: Can not display new popup, popup content is already shown.');

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

  function handleToggleCheckbox(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;

    updateFilterCriteria((x) => {
      x[name] = checked;
    });
  }

  function switchDone(nodeId: string) {
    updateTree((prevRoot) => {
      let foundTask: BaseNode | null = findNode({ root: prevRoot, nodeId });
      if (!foundTask) throw new Error('Search error: node not found.');
      foundTask.done = !foundTask.done;
    });
  }

  function addChildTask({
    parentId,
    childTask,
  }: {
    parentId: string;
    childTask: Task;
  }) {
    addChildNode({ parentId, childNode: childTask })
  }

  function addChildNode({
    parentId,
    childNode,
  }: {
    parentId: string;
    childNode: Node;
  }) {
    updateTree((prevRoot) => {
      let foundParentNode: BaseNode = findNode({
        root: prevRoot,
        nodeId: parentId,
      });
      if (!foundParentNode) throw new Error('SearchError: node not found.');
      foundParentNode.children.push(childNode);
    });
  }

  function deleteNode({ nodeId }: { nodeId: string }) {
    updateTree((prevTree) => {
      let parentNode = genericFindNode({
        root: prevTree,
        searchCondition: (node) =>
          node.children.some((child) => child.id === nodeId),
      });
      if (!parentNode) throw new Error('Search error: Element not found.');
      if (!parentNode.children)
        throw new Error(
          'Data integrity error: unexpected null children for the parent node'
        );
      parentNode.children = parentNode.children.filter((x) => x.id !== nodeId);
    });
  }

  function toggleArchiveDomain({ nodeId }: { nodeId: string }) {
    updateTree((prevTree) => {
      let foundDomain: BaseNode | null = findNode({ root: prevTree, nodeId });
      if (!foundDomain) throw new Error('Search error: node not found.');
      foundDomain.archived = !foundDomain.archived;
    });
  }

  function genericFindNode({
    root,
    searchCondition,
  }: {
    root: BaseNode;
    searchCondition: (arg: BaseNode) => boolean;
  }): BaseNode | null {
    let result = null;
    if (searchCondition(root) === true) {
      result = root;
      return result;
    }
    for (let child of root.children ?? []) {
      let tempResult = genericFindNode({ root: child, searchCondition });
      if (tempResult) {
        result = tempResult;
        return result;
      }
    }
    return result;
  }

  function findNode({
    root,
    nodeId,
  }: {
    root: BaseNode;
    nodeId: string;
  }): BaseNode | null {
    let result = null;
    if (root.id === nodeId) {
      result = root;
      return result;
    }
    for (let child of root.children ?? []) {
      let tempResult = findNode({ root: child, nodeId });
      if (tempResult) {
        result = tempResult;
        return result;
      }
    }
    return result;
  }

  function createNodeSubmitHandler({
    parentId,
    nodeType
  }: {
    parentId: string;
    nodeType: NodeType
  }) {
    return ({
      e,
      onComplete,
    }: {
      e: React.FormEvent<HTMLFormElement>;
      onComplete?: () => void;
    }) => {

      e.preventDefault();
      nodeSubmitHandler(e, onComplete, parentId, nodeType);
      hidePopup();
    };
  }

  function nodeSubmitHandler(
    e: React.FormEvent<HTMLFormElement>,
    onComplete?: () => void,
    newNodeParentId: string,
    nodeType: NodeType
  ) {

    function createNode({
      nodeData,
      nodeType,
    }: {
      nodeData: any,
      nodeType: NodeType
    }): BaseNode {
      let resultNode: BaseNode | null = null;

      if (nodeType === 'Task') {
        resultNode = new Task(nodeData);
      }
      else if (nodeType === 'Domain') {
        resultNode = new Domain(nodeData);
      }
      else {
        throw new Error('Error: unsupported node type.');
      }

      return resultNode;
    }

    e.preventDefault();
    const form = e.currentTarget;

    const data = new FormData(form);
    const nodeData = Object.fromEntries(data.entries());

    onComplete && onComplete();
    let newChildNode = createNode({ nodeData, nodeType });
    addChildNode({ parentId: newNodeParentId, childNode: newChildNode });
  }

  function saveData(baseNode) {
    localStorage.setItem('taskData', JSON.stringify(baseNode, null, 2));
  }

  function getCustomDataFields(node: BaseNode) {
    return (
      <>
        {'done' in node && (
          <span className="actions">
            <label>
              <input
                type="checkbox"
                name="done"
                checked={node.done}
                onChange={(e) => {
                  switchDone(node.id);
                }}
              />
              Done?
            </label>
          </span>
        )}
        {'dueDate' in node && node.dueDate && (
          <p>
            <u>Duedate:</u> {node.dueDate.toString()}
          </p>
        )}
        {'instructions' in node && node.instructions && (
          <p>
            <u>Instructions:</u> {node.instructions}
          </p>
        )}
      </>
    );
  }

  function getDaysLeftInline(dueDate: Temporal.PlainDate): ReactNode {
    const warningLimit = 3;
    const dangerLimit = 0;

    const daysLeft = Temporal.Now.plainDateISO().until(dueDate, {
      largestUnit: 'days',
    }).days;
    const qualifier = daysLeft > -1 ? 'left' : 'overdue';
    return (
      <span
        style={{
          fontStyle: 'italic',
          color: (() => {
            if (daysLeft > warningLimit) return 'green';
            if (daysLeft <= warningLimit && daysLeft > dangerLimit)
              return '#C7A116';
            if (daysLeft <= dangerLimit) return 'red';
          })(),
        }}
      >
        {` `}
        {Math.abs(daysLeft)} day(s) {qualifier}
      </span>
    );
  }


  function renderNode(node: BaseNode, showComplete = false, showArchived = false): ReactNode | null {
    if (node instanceof Task && node.done === true && showComplete === false) {
      return null;
    }
    if (node instanceof Domain && node.archived === true && showArchived === false) {
      return null;
    }
    return (
      <details className="content">
        <summary>
          <span
            style={{
              textDecoration: node.done ? 'line-through' : 'none',
            }}
          >
            {node.title}
          </span>
          {node.dueDate && node instanceof Task && !node.done && (
            <>{getDaysLeftInline(node.dueDate)}</>
          )}
        </summary>

        <div className="details-body">
          {getCustomDataFields(node)}
          {node.body && <p>{node.body}</p>}
          {node.children?.length > 0 &&
            [...node.children]
              .sort((a, b) => {
                if (a instanceof Task && b instanceof Task) {
                  if (a.dueDate && b.dueDate) {
                    if (a.dueDate.until(b.dueDate).days > 0) return -1;
                  }
                  return 1;
                }
                return 1;
              })
              .map((child) => renderNode(child, showComplete, showArchived))}

          <span className="actions">
            <CreateTask spawnElement={showPopup} onMenuClose={hidePopup} submitHandler={createNodeSubmitHandler({ parentId: node.id, nodeType: 'Task' })} />
            {node instanceof Domain && (
              <>
                <CreateDomain spawnElement={showPopup} onMenuClose={hidePopup} submitHandler={createNodeSubmitHandler({ parentId: node.id, nodeType: 'Domain' })} />
                <span className="action-element">
                  <button
                    onClick={() => toggleArchiveDomain({ nodeId: node.id })}
                  >
                    {node.archived ? 'Unarchive' : 'Archive'}
                  </button>
                </span>
              </>
            )}
            {node instanceof Task &&
              (
                <span className="action-element">
                  <button onClick={() => deleteNode({ nodeId: node.id })}>
                    Delete
                  </button>
                </span>
              )
            }
          </span>


        </div>
      </details>
    );
  }

  return (
    <>
      <Header downloadData={downloadData} />
      <main className={mainClassNames}>
        <section id="primary">
          <label>
            <input
              type="checkbox"
              checked={filterCriteria['showCompleteTasks'] ?? false}
              name="showCompleteTasks"
              onChange={handleToggleCheckbox}
            />
            Show complete tasks
          </label>
          <label>
            <input
              type="checkbox"
              name="showArchivedDomains"
              checked={filterCriteria['showArchivedDomains'] ?? false}
              onChange={handleToggleCheckbox}
            />
            Show archived domains
          </label>

          {renderNode(tree, filterCriteria.showCompleteTasks ?? false, filterCriteria.showArchivedDomains ?? false)}
        </section>

        <section role="region" id="secondary"
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

export default App;
