import { React } from 'react';
import { useState } from 'react';

function CreateDomain({ submitHandler }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="create-domain action-element">
      {expanded ? (
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            submitHandler({ e, onComplete: () => setExpanded(false) });
          }}
        >
          <label htmlFor="title">Title</label>
          <input name="title" />
          <button type="submit">Submit</button>
          <button name="cancel" onClick={() => setExpanded(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button className="createNewDomain" onClick={() => setExpanded(true)}>
          + Create New Domain
        </button>
      )}
    </span>
  );
}

export default CreateDomain;
