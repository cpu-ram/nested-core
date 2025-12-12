import React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';

function CreateTask({
  submitHandler,
  showPopup,
  hidePopup,
}: {
  submitHandler: ({ e, onComplete }: {
    e: React.FormEvent<HTMLFormElement>;
    onComplete: () => false | void;
  }) => void;
  showPopup: (args: { content: React.ReactNode }) => void;
  hidePopup: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const CreateTaskForm = () => {
    return (
      <form
        className="entry-form"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          submitHandler({
            e,
            onComplete: () => { },
          });
        }}
      >
        <label htmlFor="title">Title</label>
        <input name="title" required />
        <label htmlFor="dueDate">Due Date</label>
        <input name="dueDate" type="date" />
        <br /><br />
        <label htmlFor="instructions">Instructions</label>
        <TextField className="textarea-wrapper" multiline minRows={5} maxRows={20} name="instructions" />
        <button type="submit">Submit</button>
        <button name="cancel" onClick={() => hidePopup()}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <span className="create-task action-element">
      {expanded ? (
        <form
          className="entry-form"
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
          <TextField className="textarea-wrapper" multiline minRows={5} maxRows={20} name="instructions" />
          <button type="submit">Submit</button>
          <button name="cancel" onClick={() => hidePopup()}>
            Cancel
          </button>
        </form>
      ) : (
        <button name="createNewTask" onClick={() => showPopup({ content: <CreateTaskForm /> })}>
          + Create New Task
        </button>
      )}
    </span>
  );
}

export default CreateTask;
