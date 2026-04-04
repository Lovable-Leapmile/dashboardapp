import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import type { IDateComp, IDateParams } from "ag-grid-community";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const normalizeDate = (value: Date | null | undefined) => {
  if (!value || !isValid(value)) return null;
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
};

const AgGridDatePicker = forwardRef<IDateComp, IDateParams>((params, ref) => {
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const selectedDateRef = useRef<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);

  const syncDate = useCallback((date: Date | null) => {
    selectedDateRef.current = date;
    setSelectedDate(date);
  }, []);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      syncDate(normalizeDate(date));
      setOpen(false);
      params.onDateChanged();
    },
    [params, syncDate]
  );

  useImperativeHandle(
    ref,
    () => ({
      getGui: () => calendarRef.current ?? document.createElement("div"),
      getDate: () => selectedDateRef.current,
      setDate: (date: Date | null) => {
        syncDate(normalizeDate(date));
      },
      setDisabled: (nextDisabled: boolean) => {
        setDisabled(nextDisabled);
      },
      setInputPlaceholder: () => {
        // Button label is handled internally.
      },
      setInputAriaLabel: () => {
        // Button already has an accessible label.
      },
      afterGuiAttached: () => {
        const focusTarget = calendarRef.current?.querySelector("button");
        if (focusTarget instanceof HTMLButtonElement) {
          focusTarget.focus();
        }
      },
      refresh: () => {
        // AG Grid will call setDate when the filter model changes.
      },
    }),
    [syncDate]
  );

  return (
    <div ref={calendarRef} className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label="Pick filter date"
            className={cn(
              "h-9 w-full justify-start px-3 text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{selectedDate ? format(selectedDate, "dd-MM-yyyy") : "Pick a date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          className="ag-custom-component-popup w-auto p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={handleSelect}
            initialFocus
            defaultMonth={selectedDate ?? new Date()}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
});

AgGridDatePicker.displayName = "AgGridDatePicker";

export default AgGridDatePicker;