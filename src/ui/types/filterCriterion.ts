export type FilterCriterionConfig = {
  name: string;
  label: string;
  initialValue: boolean;
}

export type FilterCriterionState = {
  name: string;
  label: string;
  value: boolean;
}

export type FilterCriteriaState = {
  [name: string]: {
    label: string;
    value: boolean;
  };
}

export type FilterCriterionProps = FilterCriterionState & {
  handleToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
