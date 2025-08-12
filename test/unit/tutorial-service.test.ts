/**
 * TutorialService Unit Tests  
 * Focus: Core tutorial logic without VS Code webview dependencies
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OnboardingManager } from '../../src/engine/onboarding';

// Mock the VS Code module to avoid import errors
vi.mock('vscode', () => ({
  window: {
    createWebviewPanel: vi.fn(),
    showInformationMessage: vi.fn(),
    showTextDocument: vi.fn()
  },
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
      update: vi.fn()
    }))
  },
  ViewColumn: { One: 1 },
  Uri: {
    joinPath: vi.fn(() => ({ toString: () => 'mock://uri' }))
  }
}));

// Test the core logic without actual VS Code integration
describe('TutorialService - Core Logic', () => {
  let onboardingManager: OnboardingManager;
  let mockStorage: Map<string, any>;

  beforeEach(() => {
    mockStorage = new Map();
    const storage = {
      get: (key: string) => mockStorage.get(key),
      update: (key: string, value: any) => { mockStorage.set(key, value); return Promise.resolve(); }
    };
    
    onboardingManager = new OnboardingManager('test.tutorial', storage);
  });

  describe('Tutorial Step Management', () => {
    it('should retrieve tutorial steps from OnboardingManager', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('should validate tutorial step structure for service consumption', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      steps.forEach(step => {
        // Required for TutorialService
        expect(step.id).toBeDefined();
        expect(typeof step.id).toBe('string');
        expect(step.id.length).toBeGreaterThan(0);
        
        expect(step.title).toBeDefined();
        expect(typeof step.title).toBe('string');
        
        expect(step.content).toBeDefined();
        expect(typeof step.content).toBe('string');
        
        expect(step.type).toBeDefined();
        expect(['welcome', 'practice', 'choice', 'philosophy', 'license', 'ethics', 'start-screen']).toContain(step.type);
        
        // Optional fields validation
        if (step.eonWisdom) {
          expect(typeof step.eonWisdom).toBe('string');
          expect(step.eonWisdom.length).toBeGreaterThan(0);
        }
        
        if (step.action) {
          expect(typeof step.action).toBe('string');
        }
      });
    });

    it('should have steps in logical tutorial order', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      // First step should be start screen
      expect(steps[0].type).toBe('start-screen');
      expect(steps[0].id).toBe('game-start-screen');
      
      // Should include license step
      const hasLicense = steps.some(s => s.type === 'license');
      expect(hasLicense).toBe(true);
      
      // Should include philosophy/ethics step
      const hasPhilosophy = steps.some(s => s.type === 'philosophy');
      expect(hasPhilosophy).toBe(true);
      
      // Should include choice step
      const hasChoice = steps.some(s => s.type === 'choice');
      expect(hasChoice).toBe(true);
      
      // Last step should be completion
      const lastStep = steps[steps.length - 1];
      expect(lastStep.id).toBe('cathedral-blessing');
    });
  });

  describe('Tutorial Progress Integration', () => {
    it('should initialize tutorial progress when starting', () => {
      const initialProgress = onboardingManager.getTutorialProgress();
      expect(initialProgress.startedAt).toBeUndefined();
      
      onboardingManager.startTutorial();
      
      const afterStart = onboardingManager.getTutorialProgress();
      expect(afterStart.startedAt).toBeDefined();
      expect(afterStart.currentStep).toBe(0);
      expect(afterStart.completedSteps).toEqual([]);
    });

    it('should handle step advancement correctly', () => {
      onboardingManager.startTutorial();
      const steps = onboardingManager.getTutorialSteps();
      
      // Advance through first few steps
      for (let i = 0; i < Math.min(3, steps.length); i++) {
        const stepId = steps[i].id;
        const advanced = onboardingManager.advanceTutorialStep(stepId);
        expect(advanced).toBe(true);
        
        const progress = onboardingManager.getTutorialProgress();
        expect(progress.currentStep).toBe(i + 1);
        expect(progress.completedSteps).toContain(stepId);
      }
    });

    it('should complete tutorial with gamification choice', () => {
      onboardingManager.startTutorial();
      
      // Complete with tracking enabled
      onboardingManager.completeTutorial(true);
      
      const state = onboardingManager.getState();
      expect(state.hasSeenTour).toBe(true);
      expect(state.gamificationOptIn).toBe(true);
      expect(state.tourCompletedAt).toBeDefined();
    });
  });

  describe('Tutorial Content Validation for UI', () => {
    it('should have HTML content that can be safely rendered', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      steps.forEach(step => {
        // Content should not contain script tags (security)
        expect(step.content).not.toContain('<script');
        expect(step.content).not.toContain('javascript:');
        
        // Should contain proper HTML structure for complex steps
        if (step.type === 'choice') {
          expect(step.content).toContain('choice-paths');
        }
        
        if (step.type === 'license') {
          expect(step.content).toContain('license-box');
          expect(step.content).toContain('MIT License');
        }
        
        if (step.type === 'philosophy') {
          expect(step.content).toContain('ethics-link');
          expect(step.content).toContain('philosophy-chamber');
        }
      });
    });

    it('should have appropriate step interaction requirements', () => {
      const steps = onboardingManager.getTutorialSteps();
      const interactiveSteps = steps.filter(s => s.interactionRequired);
      
      // Should have at least one interactive step
      expect(interactiveSteps.length).toBeGreaterThan(0);
      
      interactiveSteps.forEach(step => {
        expect(step.type).toBe('practice'); // Interactive steps should be practice type
      });
    });

    it('should have consistent action button text', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      steps.forEach(step => {
        if (step.action) {
          // Action text should be appropriate length
          expect(step.action.length).toBeGreaterThan(2);
          expect(step.action.length).toBeLessThan(30);
          
          // Should not contain HTML
          expect(step.action).not.toContain('<');
          expect(step.action).not.toContain('>');
        }
      });
      
      // First step should have tutorial action
      expect(steps[0].action).toContain('Tutorial');
      
      // Last step should have completion action  
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toContain('Coding');
    });
  });

  describe('Tutorial Error Handling', () => {
    it('should handle invalid step IDs gracefully', () => {
      onboardingManager.startTutorial();
      
      // Attempt to advance with invalid step ID
      const advanced = onboardingManager.advanceTutorialStep('invalid-step-id');
      expect(advanced).toBe(true); // Still advances (lenient behavior)
      
      const progress = onboardingManager.getTutorialProgress();
      expect(progress.currentStep).toBe(1);
      expect(progress.completedSteps).toContain('invalid-step-id');
    });

    it('should handle tutorial completion without starting', () => {
      // Complete tutorial without starting (edge case)
      expect(() => onboardingManager.completeTutorial(false)).not.toThrow();
      
      const state = onboardingManager.getState();
      expect(state.hasSeenTour).toBe(true);
    });

    it('should handle multiple tutorial starts', async () => {
      onboardingManager.startTutorial();
      const firstStart = onboardingManager.getTutorialProgress().startedAt;
      
      // Wait a small amount to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // Start again - should update start time and reset progress
      onboardingManager.startTutorial();
      const secondStart = onboardingManager.getTutorialProgress().startedAt;
      
      expect(new Date(secondStart!).getTime()).toBeGreaterThan(new Date(firstStart!).getTime());
      expect(onboardingManager.getTutorialProgress().currentStep).toBe(0);
      expect(onboardingManager.getTutorialProgress().completedSteps).toEqual([]);
    });
  });

  describe('Integration Points', () => {
    it('should provide all data needed for webview rendering', () => {
      const steps = onboardingManager.getTutorialSteps();
      
      // Each step should have data needed for webview
      steps.forEach((step, index) => {
        expect(step.id).toBeDefined(); // For progress tracking
        expect(step.title).toBeDefined(); // For display
        expect(step.content).toBeDefined(); // For main content
        expect(step.type).toBeDefined(); // For styling/behavior
        
        // Navigation requirements
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(steps.length);
      });
    });

    it('should support progress calculation for UI', () => {
      onboardingManager.startTutorial();
      const steps = onboardingManager.getTutorialSteps();
      
      // Test progress calculation at different points
      for (let i = 0; i < steps.length; i++) {
        const progress = onboardingManager.getTutorialProgress();
        const percentage = progress.currentStep / steps.length;
        
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(1);
        
        if (i < steps.length - 1) {
          onboardingManager.advanceTutorialStep(steps[i].id);
        }
      }
    });
  });
});