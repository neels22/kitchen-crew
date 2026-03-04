import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCookingData } from "@/hooks/use-cooking-data";
import { Plus, Trash2 } from "lucide-react";

const EMOJI_OPTIONS = ["👨‍🍳", "🧑‍🍳", "👩‍🍳", "🍕", "🍔", "🌮", "🍜", "🍣", "🥗", "🍰", "🧁", "🍩"];

export default function MembersPage() {
  const { data, addMember, removeMember, getMemberStats } = useCookingData();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👨‍🍳");
  const [profileId, setProfileId] = useState<string | null>(null);

  const handleAdd = () => {
    if (name.trim()) {
      addMember(name.trim(), emoji);
      setName("");
      setEmoji("👨‍🍳");
      setAddOpen(false);
    }
  };

  const profileMember = data.members.find((m) => m.id === profileId);
  const profileStats = profileId ? getMemberStats(profileId) : null;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Members</h2>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 rounded-full">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.members.map((m) => {
          const stats = getMemberStats(m.id);
          return (
            <Card
              key={m.id}
              className="cursor-pointer border-border/60 transition-all hover:shadow-md active:scale-[0.98]"
              onClick={() => setProfileId(m.id)}
            >
              <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
                <span className="text-4xl">{m.emoji}</span>
                <h3 className="font-display text-base font-bold">{m.name}</h3>
                <p className="text-xs text-muted-foreground">
                  🍳 {stats.totalCooked} cooked · ❌ {stats.totalSkipped} skipped
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Pick an avatar</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`rounded-xl p-2 text-2xl transition-all ${
                    emoji === e ? "bg-primary/15 ring-2 ring-primary/40" : "hover:bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} className="w-full rounded-full">Add {emoji} {name || "Member"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile dialog */}
      <Dialog open={!!profileId} onOpenChange={() => setProfileId(null)}>
        <DialogContent className="rounded-2xl">
          {profileMember && profileStats && (
            <>
              <div className="flex flex-col items-center gap-2 pt-2 text-center">
                <span className="text-6xl">{profileMember.emoji}</span>
                <h2 className="font-display text-2xl font-bold">{profileMember.name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                <StatCard label="Cooked" value={profileStats.totalCooked} emoji="🍳" />
                <StatCard label="Skipped" value={profileStats.totalSkipped} emoji="❌" />
                <StatCard label="Streak" value={profileStats.streak} emoji="🔥" />
                <StatCard label="Last Cooked" value={profileStats.lastCooked || "—"} emoji="📅" small />
              </div>
              <Button
                variant="destructive"
                onClick={() => { removeMember(profileMember.id); setProfileId(null); }}
                className="gap-2 rounded-full"
              >
                <Trash2 className="h-4 w-4" /> Remove Member
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, emoji, small }: { label: string; value: string | number; emoji: string; small?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-secondary/50 p-3">
      <span className="text-xl">{emoji}</span>
      <span className={`font-bold ${small ? "text-xs" : "text-lg"}`}>{value}</span>
      <span className="text-[0.65rem] text-muted-foreground">{label}</span>
    </div>
  );
}
