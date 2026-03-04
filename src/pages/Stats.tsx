import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCookingData } from "@/hooks/use-cooking-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function StatsPage() {
  const { data, getMemberStats } = useCookingData();

  const leaderboard = useMemo(() => {
    return data.members
      .map((m) => ({ member: m, stats: getMemberStats(m.id) }))
      .sort((a, b) => b.stats.totalCooked - a.stats.totalCooked);
  }, [data, getMemberStats]);

  const titles = useMemo(() => {
    if (leaderboard.length === 0) return [];
    const items: { title: string; emoji: string; member: typeof leaderboard[0] }[] = [];

    if (leaderboard[0]?.stats.totalCooked > 0) {
      items.push({ title: "Chef of the Month", emoji: "👨‍🍳", member: leaderboard[0] });
    }

    const mostReliable = [...leaderboard].sort(
      (a, b) => (b.stats.totalCooked - b.stats.totalSkipped) - (a.stats.totalCooked - a.stats.totalSkipped)
    )[0];
    if (mostReliable?.stats.totalCooked > 0) {
      items.push({ title: "Most Reliable", emoji: "⭐", member: mostReliable });
    }

    const bestStreak = [...leaderboard].sort((a, b) => b.stats.streak - a.stats.streak)[0];
    if (bestStreak?.stats.streak > 0) {
      items.push({ title: "On Fire", emoji: "🔥", member: bestStreak });
    }

    const mostSkipped = [...leaderboard].sort((a, b) => b.stats.totalSkipped - a.stats.totalSkipped)[0];
    if (mostSkipped?.stats.totalSkipped > 0) {
      items.push({ title: "Most Skipped", emoji: "😅", member: mostSkipped });
    }

    return items;
  }, [leaderboard]);

  const history = useMemo(() => {
    return [...data.entries]
      .filter((e) => e.status !== "pending")
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.entries]);

  return (
    <div className="space-y-6 pb-4">
      <h2 className="font-display text-xl font-bold">Stats & History</h2>

      {/* Titles */}
      {titles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {titles.map((t) => (
            <Card key={t.title} className="min-w-[10rem] shrink-0 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/30">
              <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-xs font-bold text-primary">{t.title}</span>
                <span className="text-lg">{t.member.member.emoji}</span>
                <span className="text-sm font-semibold">{t.member.member.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <section>
        <h3 className="mb-2 font-display text-base font-bold">Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.map(({ member, stats }, i) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl bg-card border p-3">
              <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>
              <span className="text-2xl">{member.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  🍳 {stats.totalCooked} · ❌ {stats.totalSkipped} · 🔥 {stats.streak}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section>
        <h3 className="mb-2 font-display text-base font-bold">History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cooking history yet. Start assigning cooks!</p>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2 pr-3">
              {history.map((entry) => {
                const member = data.members.find((m) => m.id === entry.memberId);
                return (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border bg-card p-3">
                    <span className="text-xl">{member?.emoji || "❓"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{member?.name || "Unknown"}</span>
                        <span className="text-xs">
                          {entry.status === "cooked" ? "✅" : "❌"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.date + "T12:00"), "EEE, MMM d, yyyy")}
                      </p>
                      {entry.mealTag && <p className="text-xs mt-0.5">🍽️ {entry.mealTag}</p>}
                      {entry.note && <p className="text-xs text-muted-foreground mt-0.5">📝 {entry.note}</p>}
                      {entry.reactions && entry.reactions.length > 0 && (
                        <p className="text-sm mt-1">{entry.reactions.join(" ")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </section>
    </div>
  );
}
