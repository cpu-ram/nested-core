import { BaseNode } from '../../node/BaseNode';
import { findNode, genericFindNode } from '../findNode';
import type { TreeAction } from '../types/TreeAction';

function treeDraftReducer(draft: BaseNode, action: TreeAction): boolean {
  switch (action.type) {
    case 'ADD_CHILD_NODE':
      {
        if (!action.payload.parentId || !action.payload.childNode) {
          throw new Error('Invalid payload for ADD_CHILD_NODE action');
        }

        const payload = action.payload as {
          parentId: string;
          childNode: BaseNode;
        };

        const parentNode: BaseNode | null = findNode({
          root: draft,
          nodeId: payload.parentId,
        });
        if (!parentNode) throw new Error('Search error: node not found.');
        if (!parentNode.children) {
          throw new Error(
            'Data integrity error: unexpected null children for the parent node',
          );
        }
        parentNode.children.push(payload.childNode);

        return true;
      }
      break;

    case 'DELETE_NODE':
      {
        if (!action.payload.nodeId) {
          throw new Error('Invalid payload for DELETE_NODE action');
        }
        const { nodeId } = action.payload;
        const parentNode = genericFindNode({
          root: draft,
          searchCondition: (node) => node.children.some((child) => child.id === nodeId),
        });
        if (!parentNode) throw new Error('Search error: Element not found.');
        if (!parentNode.children) {
          throw new Error(
            'Data integrity error: unexpected null children for the parent node',
          );
        }
        parentNode.children = parentNode.children.filter(
          (x) => x.id !== nodeId,
        );

        return true;
      }
      break;

    default:
      return false;
  }
}

export default treeDraftReducer;
