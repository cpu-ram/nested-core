import { React } from 'react';
import { useState } from 'react';

function CreateTask({ submitHandler }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {expanded ? (
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            submitHandler({ e, onComplete: () => setExpanded(false) });
          }}
        >
          <label htmlFor="title">Title</label>
          <input name="title" required />
          <label htmlFor="dueDate">Due Date</label>
          <input name="dueDate" type="date" />
          <br /><br />
          <label htmlFor="instructions">Instructions</label>
          <textarea name="instructions" />
          <button type="submit">Submit</button>
          <button name="cancel" onClick={() => setExpanded(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button name="createNewTask" onClick={() => setExpanded(true)}>
          + Create New Task
        </button>
      )}
    </>
  );
}

export default CreateTask;
