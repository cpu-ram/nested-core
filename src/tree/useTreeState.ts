import { useImmer } from 'use-immer';
import { BaseNode } from '../node/BaseNode';
import { createTreeDispatcher } from './dispatchDataTreeChange';
import type TreeReducer from './types/TreeReducer';

type UseTreeStateOptions = {
  initialData: BaseNode;
  supplementalReducers?: TreeReducer[];
};

export function useTreeState(options: UseTreeStateOptions) {
  const [dataTree, updateDataTree] = useImmer<BaseNode>(options.initialData);

  const dispatch = createTreeDispatcher(
    updateDataTree,
    options.supplementalReducers,
  );

  return {
    dataTree,
    dispatch,

    addChildNode: ({ parentId, childNode }: { parentId: string; childNode: BaseNode }) => {
      dispatch({
        type: 'ADD_CHILD_NODE',
        payload: { parentId, childNode },
      });
    },
    deleteNode: ({ nodeId }: { nodeId: string }) => {
      dispatch({
        type: 'DELETE_NODE',
        payload: { nodeId },
      });
    },
    updateNode: ({
      nodeId,
      newNode,
    }: {
      nodeId: string,
      newNode: BaseNode,
    }) => {
      dispatch({
        type: 'UPDATE_NODE',
        payload: { nodeId, newNode },
      });
    },

  };
}
