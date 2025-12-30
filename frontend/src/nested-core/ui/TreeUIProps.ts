import type {
  FilterCriterionConfig,
  FilterCriteriaState,
} from './types/filterCriterion';
import { BaseNode } from '../node/BaseNode';
import type { ActionList } from './types/action';

type ImmerUpdater<T> = (updater: (draft: T) => void) => void;

type TreeUIProps = {
  dataTree: BaseNode;
  renderCustomDataFields(node: BaseNode): React.ReactNode;
  renderTitle(node: any): React.ReactNode;
  isFilteredOut(node: BaseNode, filterCriteria: FilterCriteriaState): boolean;

  actions: ActionList;
  getNodeActionsList: (node: BaseNode) => string[];
  headerActions: string[];
  initialFilterCriteria: FilterCriterionConfig[];
  nodeSort(a: any, b: any): number;
};

export type { TreeUIProps as default };
