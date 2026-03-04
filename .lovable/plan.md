

# 🍳 Cooking Duty Tracker

## Pages & Navigation
Bottom tab navigation (mobile-first): **Home**, **Schedule**, **Members**, **Stats**

## 1. Home / Dashboard
- **Today's Cook** — large hero card with assigned person's name, avatar/emoji, and status (Pending/Cooked/Skipped)
- Quick action buttons: "Mark as Cooked ✅" / "Mark as Skipped ❌" with optional note
- **This Week** — horizontal scroll of upcoming 7 days showing assigned cooks
- **Fairness Bar** — visual indicator showing cooking balance across all members

## 2. Schedule (Calendar View)
- Weekly calendar view showing assigned cooks per day
- Tap a day to assign/change the cook
- **Recurring schedules** — set "Alex cooks every Monday" via a repeat option
- **Swap feature** — select two days to swap cooks between them
- Auto-suggest button: "Who should cook next?" based on who's cooked least

## 3. Members
- List of all members with emoji avatars
- Add/remove members with name + emoji picker
- Tap a member to see their profile: total cooks, skips, current streak, last cooked date

## 4. Stats & History
- **Group leaderboard** with fun titles ("Chef of the Month 👨‍🍳", "Most Reliable", "Most Skipped")
- Per-person stat cards with cook count, skip count, streak
- **History log** — scrollable list of all past cooking entries with date, person, status, and notes

## 5. Nice-to-Haves (included)
- Meal tagging (what was cooked) as part of the "mark done" flow
- Fun emoji reactions on completed meals
- Leaderboard titles

## Data & Storage
- All data stored in localStorage for now (members, schedule, history)
- Structured so a Supabase backend can be added later easily

## Design
- Warm color palette: soft oranges, creams, and earthy tones
- Food-related emoji and icons throughout
- Rounded cards, friendly typography
- Mobile-first responsive layout, works well on desktop too

