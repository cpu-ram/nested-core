import { BaseNode } from '../../node/BaseNode';
import type TreeAction from './TreeAction';

type TreeReducer<A extends TreeAction = TreeAction> = (
  draft: BaseNode,
  action: A
) => boolean;

export type { TreeReducer as default };
