import type { FilterCriterionProps } from '../types/filterCriterion';

const FilterCriterion = (props: FilterCriterionProps) => (
  <label key={`filter-criterion-${props.name}`}>
    <input
      type="checkbox"
      checked={props.value}
      name={props.name}
      onChange={props.handleToggle}
    />
    {props.label}
  </label>
);

export default FilterCriterion;
