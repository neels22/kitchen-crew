import { useState, useEffect, useCallback } from "react";
import { AppData, Member, CookingEntry, RecurringRule, CookStatus } from "@/types/cooking";
import { format, startOfWeek, addDays } from "date-fns";

const STORAGE_KEY = "cooking-tracker-data";

const DEFAULT_MEMBERS: Member[] = [
  { id: "1", name: "Alex", emoji: "👨‍🍳" },
  { id: "2", name: "Jamie", emoji: "🧑‍🍳" },
  { id: "3", name: "Sam", emoji: "👩‍🍳" },
];

const defaultData: AppData = {
  members: DEFAULT_MEMBERS,
  entries: [],
  recurringRules: [],
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultData;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useCookingData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addMember = useCallback((name: string, emoji: string) => {
    setData((prev) => ({
      ...prev,
      members: [...prev.members, { id: crypto.randomUUID(), name, emoji }],
    }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      entries: prev.entries.filter((e) => e.memberId !== id),
      recurringRules: prev.recurringRules.filter((r) => r.memberId !== id),
    }));
  }, []);

  const getEntryForDate = useCallback(
    (date: string): CookingEntry | undefined => {
      return data.entries.find((e) => e.date === date);
    },
    [data.entries]
  );

  const assignCook = useCallback((date: string, memberId: string) => {
    setData((prev) => {
      const existing = prev.entries.findIndex((e) => e.date === date);
      const entry: CookingEntry = {
        id: existing >= 0 ? prev.entries[existing].id : crypto.randomUUID(),
        date,
        memberId,
        status: "pending",
      };
      const entries = existing >= 0
        ? prev.entries.map((e, i) => (i === existing ? { ...e, memberId, status: "pending" as CookStatus } : e))
        : [...prev.entries, entry];
      return { ...prev, entries };
    });
  }, []);

  const updateEntryStatus = useCallback(
    (date: string, status: CookStatus, note?: string, mealTag?: string) => {
      setData((prev) => ({
        ...prev,
        entries: prev.entries.map((e) =>
          e.date === date ? { ...e, status, note: note ?? e.note, mealTag: mealTag ?? e.mealTag } : e
        ),
      }));
    },
    []
  );

  const addReaction = useCallback((entryId: string, emoji: string) => {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === entryId ? { ...e, reactions: [...(e.reactions || []), emoji] } : e
      ),
    }));
  }, []);

  const swapDays = useCallback((date1: string, date2: string) => {
    setData((prev) => {
      const e1 = prev.entries.find((e) => e.date === date1);
      const e2 = prev.entries.find((e) => e.date === date2);
      if (!e1 || !e2) return prev;
      return {
        ...prev,
        entries: prev.entries.map((e) => {
          if (e.date === date1) return { ...e, memberId: e2.memberId };
          if (e.date === date2) return { ...e, memberId: e1.memberId };
          return e;
        }),
      };
    });
  }, []);

  const addRecurringRule = useCallback((memberId: string, dayOfWeek: number) => {
    setData((prev) => ({
      ...prev,
      recurringRules: [
        ...prev.recurringRules.filter((r) => r.dayOfWeek !== dayOfWeek),
        { id: crypto.randomUUID(), memberId, dayOfWeek },
      ],
    }));
  }, []);

  const removeRecurringRule = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      recurringRules: prev.recurringRules.filter((r) => r.id !== id),
    }));
  }, []);

  const applyRecurringRules = useCallback(
    (weekStart: Date) => {
      setData((prev) => {
        let entries = [...prev.entries];
        for (let i = 0; i < 7; i++) {
          const d = addDays(weekStart, i);
          const dateStr = format(d, "yyyy-MM-dd");
          const dayOfWeek = d.getDay();
          const rule = prev.recurringRules.find((r) => r.dayOfWeek === dayOfWeek);
          if (rule && !entries.find((e) => e.date === dateStr)) {
            entries.push({
              id: crypto.randomUUID(),
              date: dateStr,
              memberId: rule.memberId,
              status: "pending",
            });
          }
        }
        return { ...prev, entries };
      });
    },
    []
  );

  const suggestNextCook = useCallback((): Member | null => {
    if (data.members.length === 0) return null;
    const counts: Record<string, number> = {};
    data.members.forEach((m) => (counts[m.id] = 0));
    data.entries
      .filter((e) => e.status === "cooked")
      .forEach((e) => {
        if (counts[e.memberId] !== undefined) counts[e.memberId]++;
      });
    const min = Math.min(...Object.values(counts));
    const candidates = data.members.filter((m) => counts[m.id] === min);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [data.members, data.entries]);

  const getMemberStats = useCallback(
    (memberId: string) => {
      const memberEntries = data.entries.filter((e) => e.memberId === memberId);
      const cooked = memberEntries.filter((e) => e.status === "cooked");
      const skipped = memberEntries.filter((e) => e.status === "skipped");
      const sorted = cooked.sort((a, b) => b.date.localeCompare(a.date));
      let streak = 0;
      for (const e of sorted) {
        if (e.status === "cooked") streak++;
        else break;
      }
      return {
        totalCooked: cooked.length,
        totalSkipped: skipped.length,
        streak,
        lastCooked: sorted[0]?.date || null,
      };
    },
    [data.entries]
  );

  return {
    data,
    addMember,
    removeMember,
    getEntryForDate,
    assignCook,
    updateEntryStatus,
    addReaction,
    swapDays,
    addRecurringRule,
    removeRecurringRule,
    applyRecurringRules,
    suggestNextCook,
    getMemberStats,
  };
}
