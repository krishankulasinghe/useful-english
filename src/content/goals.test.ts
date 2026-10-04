import { GOALS, getGoal, getGoalCategoryIds, type GoalId } from './goals';

describe('Goals and Sub-Tracks', () => {
  it('defines the 5 core goals', () => {
    const expectedGoals: GoalId[] = ['workplace', 'interviews', 'daily', 'errands', 'abroad'];
    const definedIds = GOALS.map((g) => g.id);
    expect(definedIds).toEqual(expectedGoals);
  });

  it('provides sub-tracks for workplace with valid categoryIds', () => {
    const workplace = getGoal('workplace');
    expect(workplace.subTracks.length).toBeGreaterThan(0);
    const itTrack = workplace.subTracks.find((s) => s.id === 'it');
    expect(itTrack).toBeDefined();
    expect(itTrack?.categoryIds).toContain('s-technology');
  });

  it('provides sub-tracks for practical life & errands', () => {
    const errands = getGoal('errands');
    expect(errands.subTracks.length).toBeGreaterThan(0);
    const shoppingTrack = errands.subTracks.find((s) => s.id === 'shopping');
    expect(shoppingTrack).toBeDefined();
    expect(shoppingTrack?.categoryIds).toContain('s-shopping');
  });

  it('returns default categories if no sub-track provided', () => {
    const cats = getGoalCategoryIds('workplace');
    expect(cats.length).toBeGreaterThan(0);
    expect(cats).toContain('s-work-office');
  });

  it('returns sub-track specific categories if sub-track provided', () => {
    const itCats = getGoalCategoryIds('workplace', 'it');
    expect(itCats).toContain('s-technology');
  });
});
