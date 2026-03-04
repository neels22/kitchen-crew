export interface Member {
  id: string;
  name: string;
  emoji: string;
}

export type CookStatus = "pending" | "cooked" | "skipped";

export interface CookingEntry {
  id: string;
  date: string; // YYYY-MM-DD
  memberId: string;
  status: CookStatus;
  note?: string;
  mealTag?: string;
  reactions?: string[];
}

export interface RecurringRule {
  id: string;
  memberId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface AppData {
  members: Member[];
  entries: CookingEntry[];
  recurringRules: RecurringRule[];
}
