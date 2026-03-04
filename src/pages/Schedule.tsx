import { useMemo, useState } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCookingData } from "@/hooks/use-cooking-data";
import { ChevronLeft, ChevronRight, Sparkles, Repeat, ArrowLeftRight } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const {
    data, assignCook, suggestNextCook, addRecurringRule, removeRecurringRule,
    applyRecurringRules, swapDays, getEntryForDate,
  } = useCookingData();

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [recurringMember, setRecurringMember] = useState("");
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirst, setSwapFirst] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return weekOffset === 0 ? base : weekOffset > 0 ? addWeeks(base, weekOffset) : subWeeks(base, -weekOffset);
  }, [weekOffset]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const entry = data.entries.find((e) => e.date === dateStr);
      const member = data.members.find((m) => m.id === entry?.memberId);
      return { date: d, dateStr, entry, member };
    });
  }, [weekStart, data]);

  const handleDayClick = (dateStr: string) => {
    if (swapMode) {
      if (!swapFirst) {
        setSwapFirst(dateStr);
      } else {
        swapDays(swapFirst, dateStr);
        setSwapFirst(null);
        setSwapMode(false);
      }
    } else {
      setSelectedDate(dateStr);
    }
  };

  const handleAssign = (memberId: string) => {
    if (selectedDate) {
      assignCook(selectedDate, memberId);
      setSelectedDate(null);
    }
  };

  const handleAutoSuggest = () => {
    if (selectedDate) {
      const m = suggestNextCook();
      if (m) {
        assignCook(selectedDate, m.id);
        setSelectedDate(null);
      }
    }
  };

  const saveRecurring = () => {
    if (recurringMember) {
      addRecurringRule(recurringMember, recurringDay);
      setRecurringOpen(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Schedule</h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setSwapMode(!swapMode)} className={swapMode ? "text-primary" : ""}>
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setRecurringOpen(true)}>
            <Repeat className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => applyRecurringRules(weekStart)}>
            Apply Rules
          </Button>
        </div>
      </div>

      {swapMode && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary">
          {swapFirst ? "Now tap the second day to swap" : "Tap the first day to swap"}
        </p>
      )}

      {/* Week nav */}
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={() => setWeekOffset((o) => o - 1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-display text-sm font-semibold">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button size="icon" variant="ghost" onClick={() => setWeekOffset((o) => o + 1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ date, dateStr, member, entry }) => {
          const isSwapSelected = swapFirst === dateStr;
          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition-all active:scale-95 ${
                isSwapSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <span className="text-[0.6rem] font-bold uppercase text-muted-foreground">
                {format(date, "EEE")}
              </span>
              <span className="text-xs font-bold">{format(date, "d")}</span>
              <span className="text-2xl">{member?.emoji || "➕"}</span>
              <span className="truncate text-[0.55rem] font-medium leading-tight">
                {member?.name || "Assign"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recurring rules */}
      {data.recurringRules.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-bold text-muted-foreground">Recurring Rules</h4>
          <div className="space-y-1">
            {data.recurringRules.map((rule) => {
              const member = data.members.find((m) => m.id === rule.memberId);
              return (
                <div key={rule.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <span>
                    {member?.emoji} {member?.name} → Every {DAY_NAMES[rule.dayOfWeek]}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => removeRecurringRule(rule.id)} className="text-destructive h-7 px-2">
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Assign dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Cook — {selectedDate && format(new Date(selectedDate + "T12:00"), "EEE, MMM d")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {data.members.map((m) => (
              <Button key={m.id} variant="outline" onClick={() => handleAssign(m.id)} className="gap-2 rounded-xl py-6 text-base">
                <span className="text-2xl">{m.emoji}</span> {m.name}
              </Button>
            ))}
          </div>
          <Button onClick={handleAutoSuggest} variant="secondary" className="gap-2 rounded-full">
            <Sparkles className="h-4 w-4" /> Auto-suggest
          </Button>
        </DialogContent>
      </Dialog>

      {/* Recurring dialog */}
      <Dialog open={recurringOpen} onOpenChange={setRecurringOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Recurring Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={String(recurringDay)} onValueChange={(v) => setRecurringDay(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, i) => (
                  <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={recurringMember} onValueChange={setRecurringMember}>
              <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {data.members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.emoji} {m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={saveRecurring} className="w-full rounded-full">Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
