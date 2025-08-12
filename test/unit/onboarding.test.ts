/**
 * OnboardingManager Unit Tests
 * Focus: Tutorial step management, progress tracking, and content validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OnboardingManager } from '../../src/engine/onboarding';

describe('OnboardingManager - Tutorial System', () => {
  let onboardingManager: OnboardingManager;
  let mockStorage: Map<string, any>;

  beforeEach(() => {
    // Mock VS Code storage with Map
    mockStorage = new Map();
    const storage = {
      get: (key: string) => mockStorage.get(key),
      update: (key: string, value: any) => { mockStorage.set(key, value); return Promise.resolve(); }
    };
    
    onboardingManager = new OnboardingManager('test.onboarding', storage);
  });

  describe('Tutorial Progress Tracking', () => {
    it('should initialize with empty tutorial progress', () => {
      const progress = onboardingManager.getTutorialProgress();
      
      expect(progress.currentStep).toBe(0);
      expect(progress.completedSteps).toEqual([]);
      expect(progress.startedAt).toBeUndefined();
    });

    it('should start tutorial and track start time', () => {
      const beforeStart = Date.now();
      onboardingManager.startTutorial();
      const progress = onboardingManager.getTutorialProgress();
      
      expect(progress.currentStep).toBe(0);
      expect(progress.completedSteps).toEqual([]);
      expect(progress.startedAt).toBeDefined();
      
      const startTime = new Date(progress.startedAt!).getTime();
      expect(startTime).toBeGreaterThanOrEqual(beforeStart);
    });

    it('should advance tutorial steps and track completion', () => {
      onboardingManager.startTutorial();
      
      // Advance first step
      const advanced1 = onboardingManager.advanceTutorialStep('cathedral-entrance');
      expect(advanced1).toBe(true);
      
      let progress = onboardingManager.getTutorialProgress();
      expect(progress.currentStep).toBe(1);
      expect(progress.completedSteps).toContain('cathedral-entrance');
      
      // Advance second step
      onboardingManager.advanceTutorialStep('game-rules');
      progress = onboardingManager.getTutorialProgress();
      expect(progress.currentStep).toBe(2);
      expect(progress.completedSteps).toContain('game-rules');
      expect(progress.completedSteps).toHaveLength(2);
    });

    it('should not duplicate completed steps', () => {
      onboardingManager.startTutorial();
      
      // Advance same step multiple times
      onboardingManager.advanceTutorialStep('cathedral-entrance');
      onboardingManager.advanceTutorialStep('cathedral-entrance');
      onboardingManager.advanceTutorialStep('cathedral-entrance');
      
      const progress = onboardingManager.getTutorialProgress();
      expect(progress.completedSteps.filter(s => s === 'cathedral-entrance')).toHaveLength(1);
      expect(progress.currentStep).toBe(3); // Still advances step counter
    });

    it('should complete tutorial and mark as seen', () => {
      onboardingManager.startTutorial();
      expect(onboardingManager.shouldShowTour()).toBe(true);
      
      // Complete tutorial with gamification choice
      onboardingManager.completeTutorial(true);
      
      const state = onboardingManager.getState();
      expect(state.hasSeenTour).toBe(true);
      expect(state.gamificationOptIn).toBe(true);
      expect(state.tourCompletedAt).toBeDefined();
      expect(onboardingManager.shouldShowTour()).toBe(false);
    });

    it('should complete tutorial without gamification', () => {
      onboardingManager.startTutorial();
      onboardingManager.completeTutorial(false);
      
      const state = onboardingManager.getState();
      expect(state.hasSeenTour).toBe(true);
      expect(state.gamificationOptIn).toBe(false);
    });
  });

  describe('Tutorial Step Content Validation', () => {
    it('should provide 7 tutorial steps', () => {
      const steps = onboardingManager.getTutorialSteps();
      expect(steps).toHaveLength(7);
    });

    it('should have properly structured tutorial steps', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      steps.forEach((step, index) => {
        // Required fields
        expect(step.id).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.content).toBeDefined();
        expect(step.type).toBeDefined();
        
        // ID should be unique
        const otherSteps = steps.filter((_, i) => i !== index);
        expect(otherSteps.some(s => s.id === step.id)).toBe(false);
        
        // Type should be valid
        expect(['welcome', 'practice', 'choice', 'philosophy', 'license', 'ethics']).toContain(step.type);
      });
    });

    it('should include cathedral entrance as first step', () => {
      const steps = onboardingManager.getTutorialSteps();
      const firstStep = steps[0];
      
      expect(firstStep.id).toBe('cathedral-entrance');
      expect(firstStep.type).toBe('welcome');
      expect(firstStep.title).toContain('Cathedral');
      expect(firstStep.eonWisdom).toBeDefined();
    });

    it('should include license information step', () => {
      const steps = onboardingManager.getTutorialSteps();
      const licenseStep = steps.find(s => s.type === 'license');
      
      expect(licenseStep).toBeDefined();
      expect(licenseStep!.id).toBe('license-scroll');
      expect(licenseStep!.content).toContain('MIT License');
      expect(licenseStep!.content).toContain('freedom');
    });

    it('should include philosophy and ethics step', () => {
      const steps = onboardingManager.getTutorialSteps();
      const philosophyStep = steps.find(s => s.type === 'philosophy');
      
      expect(philosophyStep).toBeDefined();
      expect(philosophyStep!.id).toBe('philosophy-chamber');
      expect(philosophyStep!.content).toContain('Ethical Principles');
      expect(philosophyStep!.content).toContain('ethics-link');
    });

    it('should include interactive practice step', () => {
      const steps = onboardingManager.getTutorialSteps();
      const practiceStep = steps.find(s => s.interactionRequired === true);
      
      expect(practiceStep).toBeDefined();
      expect(practiceStep!.type).toBe('practice');
      expect(practiceStep!.content).toContain('breath');
    });

    it('should include gamification choice step', () => {
      const steps = onboardingManager.getTutorialSteps();
      const choiceStep = steps.find(s => s.type === 'choice');
      
      expect(choiceStep).toBeDefined();
      expect(choiceStep!.id).toBe('growth-chamber');
      expect(choiceStep!.content).toContain('tracked');
      expect(choiceStep!.content).toContain('simple');
    });

    it('should have Eon wisdom for key steps', () => {
      const steps = onboardingManager.getTutorialSteps();
      const stepsWithWisdom = steps.filter(s => s.eonWisdom);
      
      expect(stepsWithWisdom.length).toBeGreaterThan(3);
      
      stepsWithWisdom.forEach(step => {
        expect(step.eonWisdom!.length).toBeGreaterThan(10);
        expect(step.eonWisdom).toMatch(/[.!]/); // Should end with punctuation
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist tutorial progress across instances', () => {
      // Start and advance tutorial
      onboardingManager.startTutorial();
      onboardingManager.advanceTutorialStep('cathedral-entrance');
      onboardingManager.advanceTutorialStep('game-rules');
      
      // Create new instance with same storage
      const storage = {
        get: (key: string) => mockStorage.get(key),
        update: (key: string, value: any) => { mockStorage.set(key, value); return Promise.resolve(); }
      };
      const newManager = new OnboardingManager('test.onboarding', storage);
      
      // Should restore progress
      const progress = newManager.getTutorialProgress();
      expect(progress.currentStep).toBe(2);
      expect(progress.completedSteps).toContain('cathedral-entrance');
      expect(progress.completedSteps).toContain('game-rules');
    });

    it('should handle legacy state without tutorial progress', () => {
      // Simulate old state format
      const legacyState = {
        hasSeenTour: false,
        gamificationOptIn: false,
        engagementCount: 0,
        lastActiveDate: new Date().toDateString(),
        userPreferences: {
          messageFrequency: 'subtle',
          reminderStyle: 'gentle'
        }
      };
      
      mockStorage.set('test.onboarding', legacyState);
      
      // Should gracefully handle missing tutorialProgress
      const storage = {
        get: (key: string) => mockStorage.get(key),
        update: (key: string, value: any) => { mockStorage.set(key, value); return Promise.resolve(); }
      };
      const manager = new OnboardingManager('test.onboarding', storage);
      
      const progress = manager.getTutorialProgress();
      expect(progress.currentStep).toBe(0);
      expect(progress.completedSteps).toEqual([]);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset tutorial progress when reset is called', () => {
      // Setup some progress
      onboardingManager.startTutorial();
      onboardingManager.advanceTutorialStep('cathedral-entrance');
      onboardingManager.completeTutorial(true);
      
      expect(onboardingManager.shouldShowTour()).toBe(false);
      
      // Reset
      onboardingManager.reset();
      
      // Should be back to initial state
      expect(onboardingManager.shouldShowTour()).toBe(true);
      const progress = onboardingManager.getTutorialProgress();
      expect(progress.currentStep).toBe(0);
      expect(progress.completedSteps).toEqual([]);
      
      const state = onboardingManager.getState();
      expect(state.hasSeenTour).toBe(false);
      expect(state.gamificationOptIn).toBe(false);
    });
  });
});