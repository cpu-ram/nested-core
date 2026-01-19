import type { FilterCriteriaState } from '../types/filterCriterion';
import FilterCriterion from './FilterCriterion';

export default function FilterMenu({
  filterCriteria,
  createToggleHandler,
}: {
  filterCriteria: FilterCriteriaState;
  createToggleHandler: (criterionName: string) => () => void;
}) {
  return (
    <>
      {Object.entries(filterCriteria).map(([name, criterion]) => (
        <FilterCriterion
          key={name}
          name={name}
          label={criterion.label}
          value={criterion.value}
          handleToggle={createToggleHandler(name)}
        />
      ))}
    </>
  );
}
