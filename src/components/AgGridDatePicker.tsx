import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// AG Grid passes params as props to custom date components
interface AgGridDatePickerProps {
  onDateChanged?: () => void;
  [key: string]: any;
}

const AgGridDatePicker = forwardRef((props: AgGridDatePickerProps, ref) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const dateRef = useRef<Date | undefined>(undefined);
  const onDateChangedRef = useRef<(() => void) | undefined>(undefined);

  // AG Grid may pass onDateChanged directly or via params
  useEffect(() => {
    if (typeof props.onDateChanged === "function") {
      onDateChangedRef.current = props.onDateChanged;
    }
  }, [props.onDateChanged]);

  const handleSelect = (selected: Date | undefined) => {
    setDate(selected);
    dateRef.current = selected;
    // Notify AG Grid the date changed
    if (typeof onDateChangedRef.current === "function") {
      onDateChangedRef.current();
    } else if (typeof props.onDateChanged === "function") {
      props.onDateChanged();
    }
  };

  useImperativeHandle(ref, () => ({
    getDate() {
      return dateRef.current ?? null;
    },
    setDate(newDate: Date | null) {
      const d = newDate ?? undefined;
      dateRef.current = d;
      setDate(d);
    },
    // AG Grid may call this to set the callback
    setOnDateChanged(callback: () => void) {
      onDateChangedRef.current = callback;
    },
  }));

  return (
    <div className="ag-custom-date-picker">
      <div className="text-xs text-center font-medium text-muted-foreground mb-1">
        {date ? format(date, "dd-MM-yyyy") : "Select a date"}
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        initialFocus
        className={cn("p-2 pointer-events-auto rounded-md border bg-background")}
      />
    </div>
  );
});

AgGridDatePicker.displayName = "AgGridDatePicker";

export default AgGridDatePicker;
