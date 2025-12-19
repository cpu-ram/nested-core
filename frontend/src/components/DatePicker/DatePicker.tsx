import { DayPicker } from "react-day-picker";

import { useState } from 'react';

export default function DatePicker() {

  const [date, setDate] = useState<Date | null>(null);
  const [pickerActive, setPickerActive] = useState<boolean>(false);

  function handleDateSelection(selectedDate: Date | undefined) {
    if (!selectedDate) return;
    setDate(selectedDate);
    setPickerActive(false);
  }

  return (
    pickerActive ?
      (
        <div class="details-body">
          <DayPicker
            mode="single"
            selected={date}
            onDayClick={handleDateSelection}
          />
        </div>
      ) : (
        <button type="button" onClick={() => setPickerActive(true)}>
          {date ? date.toDateString() : "Select Date"}
        </button>
      )
  );
}