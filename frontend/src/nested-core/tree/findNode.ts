import { BaseNode } from '../node/BaseNode';

export function findNode({
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
  for (const child of root.children ?? []) {
    const tempResult = findNode({ root: child, nodeId });
    if (tempResult) {
      result = tempResult;
      return result;
    }
  }
  return result;
}

export function genericFindNode({
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
  for (const child of root.children ?? []) {
    const tempResult = genericFindNode({ root: child, searchCondition });
    if (tempResult) {
      result = tempResult;
      return result;
    }
  }
  return result;
}
