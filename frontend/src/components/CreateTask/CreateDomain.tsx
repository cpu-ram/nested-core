import { React } from 'react';
import { useState } from 'react';

function CreateDomain({
  submitHandler,
  spawnElement,
  onMenuClose,
}: {
  submitHandler: (args: { e: React.FormEvent<HTMLFormElement>; onComplete?: () => void }) => void;
  spawnElement?: (args: { content: React.ReactNode }) => void;
  onMenuClose?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  let CreateDomainForm = () => {
    return (
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          submitHandler({ e, onComplete: () => setExpanded(false) });
        }}
      >
        <label htmlFor="title">Title</label>
        <input name="title" />
        <button type="submit">Submit</button>
        <button name="cancel" onClick={() => onMenuClose && onMenuClose()}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <span className="action-element">
      <button className="createNewDomain" onClick={() => spawnElement && spawnElement({ content: <CreateDomainForm /> })}>
        + Create New Domain
      </button>
    </span>
  );
}

export default CreateDomain;
