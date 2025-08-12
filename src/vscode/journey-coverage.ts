import * as vscode from 'vscode';

export interface JourneyStepRecord {
  id: string;          // journey id
  step: string;        // step identifier
  at: string;          // ISO timestamp
}

interface JourneyDefinition {
  id: string;
  title: string;
  description: string;
  steps: string[]; // ordered canonical steps
}

// Canonical high-value user journeys we want coverage metrics for.
export const JOURNEYS: JourneyDefinition[] = [
  {
    id: 'quick-session-complete',
    title: 'Quick Start Session & Complete',
    description: 'User starts a session with a goal and ends it normally.',
    steps: ['startSession', 'breathingCycle', 'endSession']
  },
  {
    id: 'pledge-honored',
    title: 'Pledge Honored Session',
    description: 'User sets pledge, runs session meeting pledge, completes.',
    steps: ['makePledge', 'startSession', 'endSession(pledgeHonored)']
  },
  {
    id: 'stretch-preset-complete',
    title: 'Stretch Preset Completion',
    description: 'User schedules stretch preset and completes all steps.',
    steps: ['startStretchPreset', 'stretchStep', 'stretchComplete']
  },
  {
    id: 'challenge-engagement',
    title: 'Challenge Viewed & Completed',
    description: 'User views available challenges and completes one.',
    steps: ['viewChallenges', 'completeChallenge']
  },
  {
    id: 'quick-pledge-entry',
    title: 'Quick Pledge Start',
    description: 'User uses quick pledge command to pledge & start session.',
    steps: ['quickPledge', 'startSession']
  }
];

export class JourneyCoverageTracker {
  private records: JourneyStepRecord[] = [];
  private storageKey = 'breathMaster.journeyCoverage.v1';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const saved = context.globalState.get<JourneyStepRecord[]>(this.storageKey, []);
    this.records = saved || [];
  }

  record(step: { journeyId: string; step: string }) {
    const rec: JourneyStepRecord = { id: step.journeyId, step: step.step, at: new Date().toISOString() };
    this.records.push(rec);
    void this.context.globalState.update(this.storageKey, this.records);
  }

  getCoverageSummary() {
    const summary = JOURNEYS.map(j => {
      const completedSteps = new Set(
        this.records.filter(r => r.id === j.id).map(r => r.step)
      );
      const missing = j.steps.filter(s => !completedSteps.has(s));
      const pct = Math.round((completedSteps.size / j.steps.length) * 100);
      return { id: j.id, title: j.title, steps: j.steps, covered: [...completedSteps], missing, percent: pct };
    });
    return summary;
  }

  reset() {
    this.records = [];
    void this.context.globalState.update(this.storageKey, this.records);
  }

  exportJson(): string {
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      coverage: this.getCoverageSummary(),
      raw: this.records
    }, null, 2);
  }
}
