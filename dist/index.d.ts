import { immerable } from 'immer';
import * as react_jsx_runtime from 'react/jsx-runtime';

type BaseNodeArgs = {
    id?: string;
    children?: BaseNode[] | null;
    title: string;
    body?: string | null;
    type?: string;
};
declare class BaseNode {
    [immerable]: boolean;
    id: string;
    children: BaseNode[];
    title: string;
    body: string | null;
    type: string | null;
    constructor(args: BaseNodeArgs);
}

type TreeAction = {
    type: string;
    payload: Record<string, unknown>;
};

type TreeReducer<A extends TreeAction = TreeAction> = (draft: BaseNode, action: A) => boolean;

type UseTreeStateOptions = {
    initialData: BaseNode;
    supplementalReducers?: TreeReducer[];
};
declare function useTreeState(options: UseTreeStateOptions): {
    dataTree: BaseNode;
    dispatch: (action: TreeAction) => void;
    addChildNode: ({ parentId, childNode }: {
        parentId: string;
        childNode: BaseNode;
    }) => void;
    deleteNode: ({ nodeId }: {
        nodeId: string;
    }) => void;
};

declare function findNode({ root, nodeId, }: {
    root: BaseNode;
    nodeId: string;
}): BaseNode | null;
declare function genericFindNode({ root, searchCondition, }: {
    root: BaseNode;
    searchCondition: (arg: BaseNode) => boolean;
}): BaseNode | null;

type BaseAction = {
    ownRenderer?: () => React.ReactNode;
};
type NodeAction = BaseAction & {
    type: 'node';
    label: string;
    renderer?: (args: {
        hidePopup: () => void;
        callerId: string;
    }) => React.ReactNode;
    execute?: (({ callerId }: {
        callerId?: string;
    }) => void) | (({ callerId }: {
        callerId: string;
    }) => void);
};
type GlobalAction = BaseAction & {
    type: 'global';
    label: string;
    renderer?: ({ hidePopup }: {
        hidePopup: () => void;
    }) => React.ReactNode;
    execute?: () => void;
};
type Action = NodeAction | GlobalAction;
type ActionList = {
    [key: string]: Action;
};

type FilterCriterionConfig = {
    name: string;
    label: string;
    initialValue: boolean;
};
type FilterCriteriaState = {
    [name: string]: {
        label: string;
        value: boolean;
    };
};

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

declare function TreeUI(props: TreeUIProps): react_jsx_runtime.JSX.Element;

export { type Action, BaseNode, type BaseNodeArgs, type FilterCriteriaState, type FilterCriterionConfig, type TreeAction, type TreeReducer, TreeUI, findNode, genericFindNode, useTreeState };
