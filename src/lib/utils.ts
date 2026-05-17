import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Paper } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPaperKey(paper: Paper) {
  return `${paper.title}|${paper.conference}|${paper.year}`;
}
