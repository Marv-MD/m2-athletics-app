import { Skill, WorkoutLog, WorkoutTemplate } from '../types';
import { INITIAL_SKILLS, INITIAL_WORKOUT } from '../constants';

const STORAGE_KEYS = {
  LOGS: 'm2_tracker_logs',
  SKILLS: 'm2_tracker_skills',
  CURRENT_TEMPLATE: 'm2_tracker_template',
  EXERCISE_LIBRARY: 'm2_tracker_library',
  CURRENT_GOAL: 'm2_tracker_goal',
  PROFILE_IMAGE: 'm2_tracker_profile_image'
};

export const loadLogs = (): WorkoutLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = (logs: WorkoutLog[]) => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

export const loadSkills = (): Skill[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
  return data ? JSON.parse(data) : INITIAL_SKILLS;
};

export const saveSkills = (skills: Skill[]) => {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
};

export const loadTemplate = (): WorkoutTemplate => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEMPLATE);
  return data ? JSON.parse(data) : INITIAL_WORKOUT;
};

export const saveTemplate = (template: WorkoutTemplate) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_TEMPLATE, JSON.stringify(template));
};

// --- Library Service ---

export const getExerciseLibrary = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_LIBRARY);
  if (data) return JSON.parse(data);

  // Default library if empty
  return [
    'Bench Press', 'Pull Up', 'Dip', 'Squat', 'Deadlift', 
    'Overhead Press', 'Planche Lean', 'Front Lever Hold', 'Handstand Hold'
  ];
};

export const addToLibrary = (exerciseNames: string[]) => {
  const current = getExerciseLibrary();
  const newSet = new Set([...current, ...exerciseNames]);
  localStorage.setItem(STORAGE_KEYS.EXERCISE_LIBRARY, JSON.stringify(Array.from(newSet).sort()));
};

// --- Goal Service ---

export const loadGoal = (): string => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_GOAL) || "Achieve Full Planche";
};

export const saveGoal = (goal: string) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_GOAL, goal);
};

// --- Profile Image Service ---

export const loadProfileImage = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.PROFILE_IMAGE);
};

export const saveProfileImage = (base64Image: string) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE, base64Image);
};