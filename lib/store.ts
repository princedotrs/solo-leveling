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
import {
  BONUS_HISTORY_MAX,
  bonusPenaltyXp,
  findBonusQuest,
  pickNextBonusQuestId,
  type BonusQuestHistoryEntry,
} from './bonusQuests';

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

export type DayStat = {
  dailyCompleted: number;
  dailyTotal: number;
};

export type ActiveBonusQuest = {
  questId: string;
  acceptedAt: number;
  deadline: number;
};

export type BonusQuestOffer = {
  questId: string;
  offeredAt: number;
};

type State = {
  hunterName: string;
  totalXp: number;
  streak: number;
  lastRolloverDay: string;
  penaltyEnabled: boolean;

  dailyQuests: DailyQuest[];
  sideQuests: SideQuest[];

  dayLog: Record<string, DayStat>;

  pendingLevelUp: number | null;

  photoUri: string | null;
  affiliation: string;
  country: string;
  issuedAt: number;

  activeBonusQuest: ActiveBonusQuest | null;
  pendingBonusOffer: BonusQuestOffer | null;
  bonusQuestHistory: BonusQuestHistoryEntry[];
};

type Actions = {
  setHunterName: (name: string) => void;
  togglePenalty: (on: boolean) => void;
  setPhotoUri: (uri: string | null) => void;
  setAffiliation: (value: string) => void;
  setCountry: (value: string) => void;

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

  offerBonusQuestIfPossible: () => void;
  acceptBonusQuest: () => void;
  rejectBonusQuest: () => void;
  completeBonusQuest: () => void;
  forfeitBonusQuest: () => void;
  expireBonusQuestIfNeeded: () => void;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function snapshotDayStat(
  dayKey: string,
  dailyQuests: DailyQuest[]
): DayStat {
  return {
    dailyCompleted: dailyQuests.filter((q) => q.lastCompletedDay === dayKey).length,
    dailyTotal: dailyQuests.length,
  };
}

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
      dayLog: {},
      pendingLevelUp: null,
      photoUri: null,
      affiliation: 'N/A',
      country: 'Republic of Korea',
      issuedAt: Date.now(),
      activeBonusQuest: null,
      pendingBonusOffer: null,
      bonusQuestHistory: [],

      setHunterName: (hunterName) => set({ hunterName: hunterName.trim() || 'Hunter' }),
      togglePenalty: (penaltyEnabled) => set({ penaltyEnabled }),
      setPhotoUri: (photoUri) => set({ photoUri }),
      setAffiliation: (affiliation) => set({ affiliation: affiliation.trim() || 'N/A' }),
      setCountry: (country) => set({ country: country.trim() || 'N/A' }),

      addDailyQuest: (title) => {
        const t = title.trim();
        if (!t) return;
        const today = todayKey();
        set((s) => {
          const dailyQuests = [
            ...s.dailyQuests,
            { id: uid(), title: t, createdAt: Date.now(), lastCompletedDay: null },
          ];
          return {
            dailyQuests,
            dayLog: { ...s.dayLog, [today]: snapshotDayStat(today, dailyQuests) },
          };
        });
      },
      renameDailyQuest: (id, title) => {
        const t = title.trim();
        if (!t) return;
        set((s) => ({
          dailyQuests: s.dailyQuests.map((q) => (q.id === id ? { ...q, title: t } : q)),
        }));
      },
      deleteDailyQuest: (id) => {
        const today = todayKey();
        set((s) => {
          const dailyQuests = s.dailyQuests.filter((q) => q.id !== id);
          return {
            dailyQuests,
            dayLog: { ...s.dayLog, [today]: snapshotDayStat(today, dailyQuests) },
          };
        });
      },

      toggleDailyQuest: (id) => {
        const today = todayKey();
        const s = get();
        const q = s.dailyQuests.find((x) => x.id === id);
        if (!q) return;
        const isDone = q.lastCompletedDay === today;
        const dailyQuests = s.dailyQuests.map((x) =>
          x.id === id ? { ...x, lastCompletedDay: isDone ? null : today } : x
        );

        if (isDone) {
          set({
            dailyQuests,
            totalXp: Math.max(0, s.totalXp - XP_PER_DAILY),
            dayLog: { ...s.dayLog, [today]: snapshotDayStat(today, dailyQuests) },
          });
        } else {
          const before = levelFromTotalXp(s.totalXp).level;
          const nextXp = s.totalXp + XP_PER_DAILY;
          const after = levelFromTotalXp(nextXp).level;
          set({
            dailyQuests,
            totalXp: nextXp,
            pendingLevelUp: after > before ? after : s.pendingLevelUp,
            dayLog: { ...s.dayLog, [today]: snapshotDayStat(today, dailyQuests) },
          });
          const allDone =
            dailyQuests.length > 0 &&
            dailyQuests.every((x) => x.lastCompletedDay === today);
          if (allDone) {
            get().offerBonusQuestIfPossible();
          }
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

        const sealedYesterday = {
          ...s.dayLog,
          [s.lastRolloverDay]: snapshotDayStat(s.lastRolloverDay, s.dailyQuests),
          [today]: s.dayLog[today] ?? snapshotDayStat(today, s.dailyQuests),
        };

        if (s.lastRolloverDay === today) {
          set({ dayLog: sealedYesterday });
          return;
        }

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
          dayLog: sealedYesterday,
        });

        get().expireBonusQuestIfNeeded();
        get().offerBonusQuestIfPossible();
      },

      consumeLevelUp: () => set({ pendingLevelUp: null }),

      offerBonusQuestIfPossible: () => {
        const s = get();
        if (s.activeBonusQuest || s.pendingBonusOffer) return;
        const questId = pickNextBonusQuestId(s.bonusQuestHistory);
        set({ pendingBonusOffer: { questId, offeredAt: Date.now() } });
      },

      acceptBonusQuest: () => {
        const s = get();
        if (!s.pendingBonusOffer) return;
        const quest = findBonusQuest(s.pendingBonusOffer.questId);
        if (!quest) {
          set({ pendingBonusOffer: null });
          return;
        }
        const now = Date.now();
        set({
          pendingBonusOffer: null,
          activeBonusQuest: {
            questId: quest.id,
            acceptedAt: now,
            deadline: now + quest.durationHours * 3600_000,
          },
        });
      },

      rejectBonusQuest: () => {
        const s = get();
        if (!s.pendingBonusOffer) return;
        set({
          pendingBonusOffer: null,
          bonusQuestHistory: [
            ...s.bonusQuestHistory,
            {
              questId: s.pendingBonusOffer.questId,
              status: 'rejected' as const,
              at: Date.now(),
            },
          ].slice(-BONUS_HISTORY_MAX),
        });
      },

      completeBonusQuest: () => {
        const s = get();
        if (!s.activeBonusQuest) return;
        const quest = findBonusQuest(s.activeBonusQuest.questId);
        if (!quest) {
          set({ activeBonusQuest: null });
          return;
        }
        const before = levelFromTotalXp(s.totalXp).level;
        const nextXp = s.totalXp + quest.xpReward;
        const after = levelFromTotalXp(nextXp).level;
        set({
          activeBonusQuest: null,
          totalXp: nextXp,
          pendingLevelUp: after > before ? after : s.pendingLevelUp,
          bonusQuestHistory: [
            ...s.bonusQuestHistory,
            { questId: quest.id, status: 'completed' as const, at: Date.now() },
          ].slice(-BONUS_HISTORY_MAX),
        });
      },

      forfeitBonusQuest: () => {
        const s = get();
        if (!s.activeBonusQuest) return;
        const quest = findBonusQuest(s.activeBonusQuest.questId);
        const penalty = quest ? bonusPenaltyXp(quest.xpReward) : 0;
        set({
          activeBonusQuest: null,
          totalXp: Math.max(0, s.totalXp - penalty),
          bonusQuestHistory: [
            ...s.bonusQuestHistory,
            {
              questId: s.activeBonusQuest.questId,
              status: 'expired' as const,
              at: Date.now(),
            },
          ].slice(-BONUS_HISTORY_MAX),
        });
      },

      expireBonusQuestIfNeeded: () => {
        const s = get();
        if (!s.activeBonusQuest) return;
        if (Date.now() < s.activeBonusQuest.deadline) return;
        get().forfeitBonusQuest();
      },
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
        dayLog: s.dayLog,
        photoUri: s.photoUri,
        affiliation: s.affiliation,
        country: s.country,
        issuedAt: s.issuedAt,
        activeBonusQuest: s.activeBonusQuest,
        pendingBonusOffer: s.pendingBonusOffer,
        bonusQuestHistory: s.bonusQuestHistory,
      }),
    }
  )
);
