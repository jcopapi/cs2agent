/**
 * CS2 Assistant - Match Preparation Profile Manager
 * File: src/core/utility/profile-manager.ts
 *
 * Implements persistent match preparation profiles, favorite tracking,
 * and serialization for Live Match and Gemini AI tactical context binding.
 */

import type { MatchPreparationProfile, CS2Map, TeamSide } from './types';

export class ProfileManager {
  private profiles: Map<string, MatchPreparationProfile> = new Map();
  private activeProfileId: string | null = null;

  constructor(initialProfiles?: MatchPreparationProfile[]) {
    if (initialProfiles) {
      for (const p of initialProfiles) {
        this.profiles.set(p.profileId, { ...p });
        if (p.active || (p.isDefault && !this.activeProfileId)) {
          this.activeProfileId = p.profileId;
        }
      }
    }
  }

  public createProfile(
    data: Omit<MatchPreparationProfile, 'profileId' | 'createdAt' | 'updatedAt'>
  ): MatchPreparationProfile {
    const profileId = `profile-${data.map}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const profile: MatchPreparationProfile = {
      ...data,
      profileId,
      activeStrategies: data.activeStrategies || [...data.selectedStrategyIds],
      favoriteLineups: data.favoriteLineups || [...data.selectedLineupIds],
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.set(profileId, profile);
    if (profile.active) {
      this.activeProfileId = profileId;
    }
    return { ...profile };
  }

  public getProfile(profileId: string): MatchPreparationProfile | null {
    const p = this.profiles.get(profileId);
    return p ? { ...p } : null;
  }

  public updateProfile(
    profileId: string,
    updates: Partial<Omit<MatchPreparationProfile, 'profileId' | 'createdAt'>>
  ): MatchPreparationProfile | null {
    const existing = this.profiles.get(profileId);
    if (!existing) return null;

    const updated: MatchPreparationProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(profileId, updated);
    if (updated.active) {
      this.activeProfileId = profileId;
    }
    return { ...updated };
  }

  public deleteProfile(profileId: string): boolean {
    if (this.activeProfileId === profileId) {
      this.activeProfileId = null;
    }
    return this.profiles.delete(profileId);
  }

  public listProfiles(filter?: { map?: CS2Map; side?: TeamSide }): MatchPreparationProfile[] {
    let result = Array.from(this.profiles.values());
    if (filter?.map) result = result.filter((p) => p.map === filter.map);
    if (filter?.side) result = result.filter((p) => p.side === filter.side || p.side === 'BOTH');
    return result.map((p) => ({ ...p }));
  }

  public getActiveProfile(): MatchPreparationProfile | null {
    if (!this.activeProfileId) return null;
    return this.getProfile(this.activeProfileId);
  }

  public setActiveProfile(profileId: string | null): boolean {
    if (profileId === null) {
      if (this.activeProfileId) {
        const curr = this.profiles.get(this.activeProfileId);
        if (curr) curr.active = false;
      }
      this.activeProfileId = null;
      return true;
    }
    if (!this.profiles.has(profileId)) {
      return false;
    }
    if (this.activeProfileId && this.activeProfileId !== profileId) {
      const prev = this.profiles.get(this.activeProfileId);
      if (prev) prev.active = false;
    }
    this.activeProfileId = profileId;
    const activeProf = this.profiles.get(profileId);
    if (activeProf) activeProf.active = true;
    return true;
  }

  /**
   * Generates a context summary for injection into the Live Match Engine and Gemini Tactical Coach context.
   */
  public getAiContextBinding(): {
    activeProfileName: string;
    rehearsedStrategies: string[];
    favoriteLineups: string[];
  } | null {
    const active = this.getActiveProfile();
    if (!active) return null;
    return {
      activeProfileName: active.name,
      rehearsedStrategies: active.activeStrategies || [...active.selectedStrategyIds],
      favoriteLineups: active.favoriteLineups || [...active.selectedLineupIds],
    };
  }
}
