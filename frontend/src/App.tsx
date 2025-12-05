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
import { getData } from './data/getData.ts';

import CreateTask from './components/CreateTask/CreateTask.tsx';
import CreateDomain from './components/CreateTask/CreateDomain.tsx';

BaseNode.prototype[immerable] = true;

function App() {
  const [tree, updateTree] = useImmer<BaseNode>(getData());
  const [filterCriteria, updateFilterCriteria] = useImmer<{
    [criterion: string]: boolean;
  }>({});

  useEffect(() => {
    localStorage.setItem('taskData', JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    updateFilterCriteria((x) => {
      x.showCompleteTasks = false;
    });
  }, []);

  const data = getData({ testMode: false });

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

  function createTaskSubmitHandler(newTaskParentId: string) {
    return ({
      e,
      onComplete,
    }: {
      e: React.FormEvent<HTMLFormElement>;
      onComplete?: () => void;
    }) => {
      e.preventDefault();
      taskSubmitHandler(e, onComplete, newTaskParentId);
    };
  }

  function createDomainSubmitHandler(newDomainParentId: string) {
    return ({
      e,
      onComplete,
    }: {
      e: React.FormEvent<HTMLFormElement>;
      onComplete?: () => void;
    }) => {
      e.preventDefault();
      domainSubmitHandler(e, onComplete, newDomainParentId);
    };
  }


  function taskSubmitHandler(
    e: React.FormEvent<HTMLFormElement>,
    onComplete?: () => void,
    newTaskParentId: string,
  ) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const taskData = Object.fromEntries(data.entries());
    onComplete && onComplete();
    let task = new Task(taskData);
    addChildTask({ parentId: newTaskParentId, childTask: task });
    console.log(JSON.stringify(task));
  }

  function domainSubmitHandler(
    e: React.FormEvent<HTMLFormElement>,
    onComplete?,
    newTaskParentId
  ) {
    e.preventDefault();
    const form = e.currentTarget;

    const data = new FormData(form);
    const domainData = Object.fromEntries(data.entries());

    onComplete && onComplete();
    let domain = new Domain(domainData);
    addChildNode({ parentId: newTaskParentId, childNode: domain });
    console.log(JSON.stringify(domain));
  }

  function saveData(baseNode) {
    localStorage.setItem('taskData', JSON.stringify(baseNode, null, 2));
  }

  function getCustomDataFields(node: BaseNode) {
    return (
      <>
        {'done' in node && (
          <>
            <input
              type="checkbox"
              name="done"
              checked={node.done}
              onChange={(e) => {
                switchDone(node.id);
              }}
            />
            <label>Done?</label>
          </>
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

  function getDaysLeftString(dueDate: Temporal.PlainDate): ReactNode {
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

  function renderNode(node: BaseNode, showComplete = false): ReactNode | null {
    if (node instanceof Task && node.done === true && showComplete === false)
      return null;
    return (
      <details>
        <summary>
          <span
            style={{
              textDecoration: node.done ? 'line-through' : 'none',
            }}
          >
            {node.title}
          </span>
          {node.dueDate && node instanceof Task && !node.done && (
            <>{getDaysLeftString(node.dueDate)}</>
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
              .map((child) => renderNode(child, showComplete))}

          <CreateTask submitHandler={createTaskSubmitHandler(node.id)} />
          {node instanceof Domain && (
            <CreateDomain submitHandler={createDomainSubmitHandler(node.id)} />
          )}

          {node instanceof Task &&
            (<button onClick={() => deleteNode({ nodeId: node.id })}>
              Delete
            </button>)
          }


        </div>
      </details>
    );
  }

  return (
    <>
      <input
        type="checkbox"
        checked={filterCriteria['showCompleteTasks'] ?? false}
        name="showCompleteTasks"
        onChange={handleToggleCheckbox}
      />
      <label>Show complete tasks</label>
      {renderNode(tree, filterCriteria.showCompleteTasks ?? false)}
    </>
  );
}

export default App;
