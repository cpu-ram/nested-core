import { DayPicker } from "react-day-picker";

import { useState, useEffect, useRef } from 'react';

export default function DatePicker() {

  const [date, setDate] = useState<Date | null>(null);
  const [pickerActive, setPickerActive] = useState<boolean>(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const readyToReturnFocus = useRef<boolean>(false);

  useEffect(() => {
    if (!pickerActive && readyToReturnFocus.current) {
      buttonRef.current?.focus();
      readyToReturnFocus.current = false;
    }
    else if (pickerActive) {
      readyToReturnFocus.current = true;
    }
  }, [pickerActive]);

  function handleDateSelection(selectedDate: Date | undefined) {
    if (!selectedDate) return;
    setDate(selectedDate);
    setPickerActive(false);

    buttonRef.current?.focus();
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLDivElement>) {
    if (pickerActive && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setPickerActive(false);
    }
  }

  return (
    pickerActive ?
      (
        <div class="details-body" onKeyDown={handleKeyPress}>
          <DayPicker
            mode="single"
            selected={date}
            onDayClick={handleDateSelection}
          />
        </div>
      ) : (
        <button type="button" ref={buttonRef} onClick={() => setPickerActive(true)}>
          {date ? date.toDateString() : "Select Date"}
        </button>
      )
  );
}