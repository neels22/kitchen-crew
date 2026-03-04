import { useMemo, useState } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCookingData } from "@/hooks/use-cooking-data";
import { CookStatus } from "@/types/cooking";
import { Check, X, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusConfig: Record<CookStatus, { label: string; emoji: string; color: string }> = {
  pending: { label: "Pending", emoji: "⏳", color: "text-warning" },
  cooked: { label: "Cooked", emoji: "✅", color: "text-success" },
  skipped: { label: "Skipped", emoji: "❌", color: "text-destructive" },
};

export default function HomePage() {
  const { data, getEntryForDate, updateEntryStatus, suggestNextCook, assignCook, getMemberStats } = useCookingData();
  const today = format(startOfToday(), "yyyy-MM-dd");
  const todayEntry = getEntryForDate(today);
  const todayCook = data.members.find((m) => m.id === todayEntry?.memberId);

  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [markStatus, setMarkStatus] = useState<CookStatus>("cooked");
  const [note, setNote] = useState("");
  const [mealTag, setMealTag] = useState("");

  const weekDays = useMemo(() => {
    const start = startOfToday();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const entry = data.entries.find((e) => e.date === dateStr);
      const member = data.members.find((m) => m.id === entry?.memberId);
      return { date: d, dateStr, entry, member };
    });
  }, [data]);

  const fairness = useMemo(() => {
    if (data.members.length === 0) return [];
    const counts: Record<string, number> = {};
    data.members.forEach((m) => (counts[m.id] = 0));
    data.entries.filter((e) => e.status === "cooked").forEach((e) => {
      if (counts[e.memberId] !== undefined) counts[e.memberId]++;
    });
    const max = Math.max(...Object.values(counts), 1);
    return data.members.map((m) => ({
      member: m,
      count: counts[m.id],
      pct: (counts[m.id] / max) * 100,
    }));
  }, [data]);

  const openMarkDialog = (status: CookStatus) => {
    setMarkStatus(status);
    setNote("");
    setMealTag("");
    setMarkDialogOpen(true);
  };

  const confirmMark = () => {
    updateEntryStatus(today, markStatus, note || undefined, mealTag || undefined);
    setMarkDialogOpen(false);
  };

  const handleSuggest = () => {
    const member = suggestNextCook();
    if (member) assignCook(today, member.id);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Today's Cook Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-card to-secondary/30 shadow-lg">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Today's Cook
          </p>
          {todayCook ? (
            <>
              <span className="text-6xl animate-pop-in">{todayCook.emoji}</span>
              <h2 className="font-display text-2xl font-bold">{todayCook.name}</h2>
              <span className={`text-sm font-semibold ${statusConfig[todayEntry!.status].color}`}>
                {statusConfig[todayEntry!.status].emoji} {statusConfig[todayEntry!.status].label}
              </span>
              {todayEntry!.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => openMarkDialog("cooked")} className="gap-1.5 rounded-full">
                    <Check className="h-4 w-4" /> Cooked
                  </Button>
                  <Button variant="outline" onClick={() => openMarkDialog("skipped")} className="gap-1.5 rounded-full">
                    <X className="h-4 w-4" /> Skipped
                  </Button>
                </div>
              )}
              {todayEntry?.mealTag && (
                <p className="text-sm text-muted-foreground">🍽️ {todayEntry.mealTag}</p>
              )}
            </>
          ) : (
            <>
              <span className="text-5xl">🍳</span>
              <p className="text-muted-foreground">No one assigned yet</p>
              <Button onClick={handleSuggest} variant="secondary" className="gap-1.5 rounded-full">
                <Sparkles className="h-4 w-4" /> Suggest a cook
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* This Week */}
      <section>
        <h3 className="mb-3 font-display text-lg font-bold">This Week</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {weekDays.map(({ date, dateStr, member, entry }) => {
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                className={`flex min-w-[4.5rem] flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-all ${
                  isToday ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-card"
                }`}
              >
                <span className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                  {format(date, "EEE")}
                </span>
                <span className="text-xs font-bold">{format(date, "d")}</span>
                <span className="text-xl">{member?.emoji || "—"}</span>
                <span className="truncate text-[0.6rem] font-medium">{member?.name || ""}</span>
                {entry && (
                  <span className="text-[0.6rem]">{statusConfig[entry.status].emoji}</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Fairness Bar */}
      {fairness.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-lg font-bold">Fairness</h3>
          <div className="space-y-2">
            {fairness.map(({ member, count, pct }) => (
              <div key={member.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg">{member.emoji}</span>
                <span className="w-16 truncate text-sm font-medium">{member.name}</span>
                <Progress value={pct} className="h-2.5 flex-1" />
                <span className="w-6 text-right text-xs font-bold text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mark Dialog */}
      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {markStatus === "cooked" ? "✅ Mark as Cooked" : "❌ Mark as Skipped"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {markStatus === "cooked" && (
              <Input
                placeholder="What was cooked? (e.g. Pasta 🍝)"
                value={mealTag}
                onChange={(e) => setMealTag(e.target.value)}
              />
            )}
            <Input placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={confirmMark} className="w-full rounded-full">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
