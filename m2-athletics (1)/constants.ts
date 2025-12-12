import { ExerciseType, Skill, SkillCategory, WorkoutTemplate } from './types';

const createSkill = (id: string, name: string, req: string, cat: SkillCategory, parent?: string, unlocked = false): Skill => ({
  id, name, description: `Master the ${name}`, requirements: req, category: cat, parentId: parent, unlocked
});

export const INITIAL_SKILLS: Skill[] = [
  // Planche
  createSkill('pl1', 'Frog Stand', 'Hold 30s', SkillCategory.PLANCHE, undefined, true),
  createSkill('pl2', 'Tuck Planche', 'Frog Stand 30s', SkillCategory.PLANCHE, 'pl1'),
  createSkill('pl3', 'Adv. Tuck Planche', 'Tuck 15s', SkillCategory.PLANCHE, 'pl2'),
  createSkill('pl4', 'Straddle Planche', 'Adv Tuck 10s', SkillCategory.PLANCHE, 'pl3'),
  createSkill('pl5', 'Full Planche', 'Straddle 5s', SkillCategory.PLANCHE, 'pl4'),

  // Front Lever
  createSkill('fl1', 'Tuck Front Lever', 'Hold 20s', SkillCategory.FRONT_LEVER, undefined, true),
  createSkill('fl2', 'Adv. Tuck FL', 'Tuck 20s', SkillCategory.FRONT_LEVER, 'fl1'),
  createSkill('fl3', 'Straddle FL', 'Adv Tuck 10s', SkillCategory.FRONT_LEVER, 'fl2'),
  createSkill('fl4', 'Full Front Lever', 'Straddle 5s', SkillCategory.FRONT_LEVER, 'fl3'),

  // Back Lever
  createSkill('bl1', 'German Hang', 'Comfortable 30s', SkillCategory.BACK_LEVER, undefined, true),
  createSkill('bl2', 'Tuck Back Lever', 'German Hang', SkillCategory.BACK_LEVER, 'bl1'),
  createSkill('bl3', 'Full Back Lever', 'Tuck 15s', SkillCategory.BACK_LEVER, 'bl2'),

  // Muscle Up
  createSkill('mu1', 'High Pull Up', '10 Reps', SkillCategory.MUSCLE_UP, undefined, true),
  createSkill('mu2', 'Negative MU', 'Control descent', SkillCategory.MUSCLE_UP, 'mu1'),
  createSkill('mu3', 'Kipping MU', 'Use hips', SkillCategory.MUSCLE_UP, 'mu2'),
  createSkill('mu4', 'Strict MU', 'No momentum', SkillCategory.MUSCLE_UP, 'mu3'),

  // Handstand
  createSkill('hs1', 'Wall Hold', '60s Chest to wall', SkillCategory.HANDSTAND, undefined, true),
  createSkill('hs2', 'Kick Up', 'Find balance', SkillCategory.HANDSTAND, 'hs1'),
  createSkill('hs3', 'Freestanding HS', 'Hold 10s', SkillCategory.HANDSTAND, 'hs2'),
  createSkill('hs4', 'HS Pushup', '1 Rep', SkillCategory.HANDSTAND, 'hs3'),

  // Human Flag
  createSkill('hf1', 'Vertical Flag', 'Hold 20s', SkillCategory.HUMAN_FLAG, undefined, true),
  createSkill('hf2', 'Tuck Flag', 'Vertical 20s', SkillCategory.HUMAN_FLAG, 'hf1'),
  createSkill('hf3', 'Full Flag', 'Tuck 10s', SkillCategory.HUMAN_FLAG, 'hf2'),

  // Dragon Squat
  createSkill('ds1', 'Deep Squat', 'Ass to grass', SkillCategory.DRAGON_SQUAT, undefined, true),
  createSkill('ds2', 'Shrimp Squat', '5 Reps', SkillCategory.DRAGON_SQUAT, 'ds1'),
  createSkill('ds3', 'Pistol Squat', '5 Reps', SkillCategory.DRAGON_SQUAT, 'ds2'),
  createSkill('ds4', 'Dragon Squat', '1 Rep', SkillCategory.DRAGON_SQUAT, 'ds3'),
];

export const INITIAL_WORKOUT: WorkoutTemplate = {
  id: 'w1',
  name: 'Iron Push Day',
  exercises: [
    {
      id: 'e1',
      name: 'Tuck Planche Hold',
      type: ExerciseType.DURATION_WEIGHT,
      sets: [
        { id: 's1-1', weight: 0, repsOrDuration: 10, completed: false },
        { id: 's1-2', weight: 0, repsOrDuration: 10, completed: false },
        { id: 's1-3', weight: 0, repsOrDuration: 10, completed: false },
      ],
    },
    {
      id: 'e2',
      name: 'Weighted Dips',
      type: ExerciseType.REPS_WEIGHT,
      sets: [
        { id: 's2-1', weight: 10, repsOrDuration: 8, completed: false },
        { id: 's2-2', weight: 10, repsOrDuration: 8, completed: false },
        { id: 's2-3', weight: 10, repsOrDuration: 8, completed: false },
      ],
    },
  ],
};