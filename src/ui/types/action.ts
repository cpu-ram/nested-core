type BaseAction = {
  ownRenderer?: () => React.ReactNode;
}

type NodeAction = BaseAction & {
  type: 'node';

  label: string;

  renderer?: (args: {
    hidePopup: () => void;
    callerId: string;
  }) => React.ReactNode;

  execute?:
  | (({ callerId }: { callerId?: string }) => void)
  | (({ callerId }: { callerId: string }) => void);
};

type GlobalAction = BaseAction & {
  type: 'global';

  label: string;

  renderer?: ({ hidePopup }: { hidePopup: () => void }) => React.ReactNode;

  execute?: () => void;
};

type Action = NodeAction | GlobalAction;

type ActionList = {
  [key: string]: Action;
};

export type { Action, ActionList };
