import React from 'react';
import { Flame, TrendingUp, Minus } from 'lucide-react';

const STATUS_WEIGHTS = {
  'Interested': 30,
  'Negotiating': 25,
  'Follow-up Needed': 22,
  'Meeting Scheduled': 18,
  'NDA Sent': 12,
  'Contacted': 8,
  'Passed': 0,
};

const PRIORITY_TIERS = {
  high: { label: 'High', icon: Flame, className: 'bg-red-500/20 text-red-400 border-red-500/40', scoreClass: 'text-red-400' },
  medium: { label: 'Medium', icon: TrendingUp, className: 'bg-amber-500/20 text-amber-400 border-amber-500/40', scoreClass: 'text-amber-400' },
  low: { label: 'Low', icon: Minus, className: 'bg-slate-500/20 text-slate-400 border-slate-500/40', scoreClass: 'text-slate-400' },
};

export function calculatePriorityScore(meeting) {
  let score = 0;

  // Status weight (0-30)
  score += STATUS_WEIGHTS[meeting.status] ?? 5;

  // Interest level (5-25)
  const interest = parseInt(meeting.interest_level) || 3;
  score += interest * 5;

  // Interaction richness
  if (meeting.feedback && meeting.feedback.trim().length > 10) score += 5;
  if (meeting.next_steps && meeting.next_steps.trim().length > 5) score += 5;
  if (meeting.documents_reviewed && meeting.documents_reviewed.trim()) score += 5;
  const pillarCount = (meeting.pillars_discussed || []).length;
  score += Math.min(pillarCount, 4) * 3; // up to 12

  // Follow-up urgency
  if (meeting.follow_up_date) {
    const fuDate = new Date(meeting.follow_up_date);
    const now = new Date();
    const diffDays = (fuDate - now) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) score += 12;      // imminent
    else if (diffDays >= 0 && diffDays <= 14) score += 6;  // upcoming
    else if (diffDays < 0) score += 8;                     // overdue
  }

  // Meeting recency
  if (meeting.meeting_date) {
    const mDate = new Date(meeting.meeting_date);
    const diffDays = (new Date() - mDate) / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) score += 5;
  }

  return Math.min(score, 100);
}

export function getPriorityTier(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export default function PriorityBadge({ meeting, showScore = true }) {
  const score = calculatePriorityScore(meeting);
  const tier = getPriorityTier(score);
  const config = PRIORITY_TIERS[tier];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label} Priority
      {showScore && <span className={config.scoreClass}>· {score}</span>}
    </div>
  );
}