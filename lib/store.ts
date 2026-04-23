import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  XP_PER_DAILY,
  XP_PER_SIDE,
  XP_PENALTY_PER_MISSED_DAILY,
  levelFromTotalXp,
  todayKey,
  daysBetween,
} from './leveling';

export type DailyQuest = {
  id: string;
  title: string;
  createdAt: number;
  lastCompletedDay: string | null;
};

export type SideQuest = {
  id: string;
  title: string;
  createdAt: number;
  completedAt: number | null;
};

type State = {
  hunterName: string;
  totalXp: number;
  streak: number;
  lastRolloverDay: string;
  penaltyEnabled: boolean;

  dailyQuests: DailyQuest[];
  sideQuests: SideQuest[];

  pendingLevelUp: number | null;
};

type Actions = {
  setHunterName: (name: string) => void;
  togglePenalty: (on: boolean) => void;

  addDailyQuest: (title: string) => void;
  renameDailyQuest: (id: string, title: string) => void;
  deleteDailyQuest: (id: string) => void;
  toggleDailyQuest: (id: string) => void;

  addSideQuest: (title: string) => void;
  renameSideQuest: (id: string, title: string) => void;
  deleteSideQuest: (id: string) => void;
  completeSideQuest: (id: string) => void;

  rolloverIfNeeded: () => void;
  consumeLevelUp: () => void;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      hunterName: 'Hunter',
      totalXp: 0,
      streak: 0,
      lastRolloverDay: todayKey(),
      penaltyEnabled: true,
      dailyQuests: [],
      sideQuests: [],
      pendingLevelUp: null,

      setHunterName: (hunterName) => set({ hunterName: hunterName.trim() || 'Hunter' }),
      togglePenalty: (penaltyEnabled) => set({ penaltyEnabled }),

      addDailyQuest: (title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => ({
          dailyQuests: [
            ...s.dailyQuests,
            { id: uid(), title: t, createdAt: Date.now(), lastCompletedDay: null },
          ],
        }));
      },
      renameDailyQuest: (id, title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => ({
          dailyQuests: s.dailyQuests.map((q) => (q.id === id ? { ...q, title: t } : q)),
        }));
      },
      deleteDailyQuest: (id) =>
        set((s) => ({ dailyQuests: s.dailyQuests.filter((q) => q.id !== id) })),

      toggleDailyQuest: (id) => {
        const today = todayKey();
        const s = get();
        const q = s.dailyQuests.find((x) => x.id === id);
        if (!q) return;
        const isDone = q.lastCompletedDay === today;
        if (isDone) {
          set({
            dailyQuests: s.dailyQuests.map((x) =>
              x.id === id ? { ...x, lastCompletedDay: null } : x
            ),
            totalXp: Math.max(0, s.totalXp - XP_PER_DAILY),
          });
        } else {
          const before = levelFromTotalXp(s.totalXp).level;
          const nextXp = s.totalXp + XP_PER_DAILY;
          const after = levelFromTotalXp(nextXp).level;
          set({
            dailyQuests: s.dailyQuests.map((x) =>
              x.id === id ? { ...x, lastCompletedDay: today } : x
            ),
            totalXp: nextXp,
            pendingLevelUp: after > before ? after : s.pendingLevelUp,
          });
        }
      },

      addSideQuest: (title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => ({
          sideQuests: [
            ...s.sideQuests,
            { id: uid(), title: t, createdAt: Date.now(), completedAt: null },
          ],
        }));
      },
      renameSideQuest: (id, title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => ({
          sideQuests: s.sideQuests.map((q) => (q.id === id ? { ...q, title: t } : q)),
        }));
      },
      deleteSideQuest: (id) =>
        set((s) => ({ sideQuests: s.sideQuests.filter((q) => q.id !== id) })),

      completeSideQuest: (id) => {
        const s = get();
        const q = s.sideQuests.find((x) => x.id === id);
        if (!q) return;
        if (q.completedAt) {
          set({
            sideQuests: s.sideQuests.map((x) =>
              x.id === id ? { ...x, completedAt: null } : x
            ),
            totalXp: Math.max(0, s.totalXp - XP_PER_SIDE),
          });
        } else {
          const before = levelFromTotalXp(s.totalXp).level;
          const nextXp = s.totalXp + XP_PER_SIDE;
          const after = levelFromTotalXp(nextXp).level;
          set({
            sideQuests: s.sideQuests.map((x) =>
              x.id === id ? { ...x, completedAt: Date.now() } : x
            ),
            totalXp: nextXp,
            pendingLevelUp: after > before ? after : s.pendingLevelUp,
          });
        }
      },

      rolloverIfNeeded: () => {
        const today = todayKey();
        const s = get();
        if (s.lastRolloverDay === today) return;

        const daysSince = daysBetween(s.lastRolloverDay, today);
        const completedYesterdayIds = s.dailyQuests
          .filter((q) => q.lastCompletedDay === s.lastRolloverDay)
          .map((q) => q.id);
        const allYesterdayDone =
          s.dailyQuests.length > 0 && completedYesterdayIds.length === s.dailyQuests.length;

        let newStreak = s.streak;
        if (daysSince === 1) {
          newStreak = allYesterdayDone ? s.streak + 1 : 0;
        } else {
          newStreak = 0;
        }

        let nextXp = s.totalXp;
        if (s.penaltyEnabled && s.dailyQuests.length > 0) {
          const missedCount = s.dailyQuests.filter(
            (q) => q.lastCompletedDay !== s.lastRolloverDay
          ).length;
          const penalty = missedCount * XP_PENALTY_PER_MISSED_DAILY * Math.max(1, daysSince);
          nextXp = Math.max(0, nextXp - penalty);
        }

        set({
          lastRolloverDay: today,
          streak: newStreak,
          totalXp: nextXp,
        });
      },

      consumeLevelUp: () => set({ pendingLevelUp: null }),
    }),
    {
      name: 'solo-leveling@v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hunterName: s.hunterName,
        totalXp: s.totalXp,
        streak: s.streak,
        lastRolloverDay: s.lastRolloverDay,
        penaltyEnabled: s.penaltyEnabled,
        dailyQuests: s.dailyQuests,
        sideQuests: s.sideQuests,
      }),
    }
  )
);
