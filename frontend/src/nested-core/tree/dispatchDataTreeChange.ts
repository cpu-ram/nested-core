import { BaseNode } from '../node/BaseNode';
import type TreeAction from './types/TreeAction';
import type TreeReducer from './types/TreeReducer';
import treeDraftReducer from './reducers/treeDraftReducer';

type ImmerUpdater<T> = (updater: (draft: T) => void) => void;

function dispatchDataTreeChange(
  updateFn: ImmerUpdater<BaseNode>,
  action: TreeAction,
  supplementalReducers?: TreeReducer[],
) {
  updateFn((draft) => {
    let handled = false;

    for (const reducer of [treeDraftReducer, ...(supplementalReducers || [])]) {
      handled = reducer(draft, action);
      if (handled) {
        break;
      }
    }

    if (!handled) {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  });
}

export function createTreeDispatcher(
  updateDataTree: ImmerUpdater<BaseNode>,
  supplementalReducers?: TreeReducer[],
) {
  return (action: TreeAction) => dispatchDataTreeChange(updateDataTree, action, supplementalReducers);
}
