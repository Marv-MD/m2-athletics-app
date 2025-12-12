export enum ExerciseType {
  REPS_WEIGHT = 'REPS_WEIGHT', // Type A
  DURATION_WEIGHT = 'DURATION_WEIGHT', // Type B
}

export interface SetData {
  id: string;
  weight: number | string;
  repsOrDuration: number | string; // Reps for Type A, Seconds for Type B
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets: SetData[];
  supersetId?: string; // If present, groups exercises visually
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  startTime?: number; // Timestamp when workout started
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  durationSeconds: number;
  templateName: string;
  exercises: Exercise[];
  totalVolume: number;
}

export enum SkillCategory {
  PLANCHE = 'PLANCHE',
  FRONT_LEVER = 'FRONT_LEVER',
  BACK_LEVER = 'BACK_LEVER',
  MUSCLE_UP = 'MUSCLE_UP',
  HANDSTAND = 'HANDSTAND',
  HUMAN_FLAG = 'HUMAN_FLAG',
  DRAGON_SQUAT = 'DRAGON_SQUAT',
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  requirements: string; // Text description of requirement
  unlocked: boolean;
  parentId?: string; // For tree structure
  category: SkillCategory;
}

export enum AppTab {
  HOME = 'HOME',
  WORKOUT = 'WORKOUT',
  SKILLS = 'SKILLS',
  PROGRESS = 'PROGRESS',
}