import { Project } from "../models/project";
import statisticsService from "../services/statistics.service";

describe("StatisticsService", () => {
  const mockProject = new Project({
    name: "Test",
    folder: "/test",
    languages: [
      { code: "en", base: true },
      { code: "fr", base: false },
    ],
    initialize: true,
  });

  // Manually set up translation data for test
  mockProject.translation = {
    en: {
      data: [
        { key: "a", value: "A" },
        { key: "b", value: "" },
      ],
    },
    fr: {
      data: [
        { key: "a", value: "A_fr" },
        { key: "b", value: "" },
      ],
    },
  };

  mockProject.getDefaultTranslation = () => mockProject.translation.en;

  beforeEach(() => {
    mockProject.calculation();
  });

  test("getKeyCount returns base language key count", () => {
    expect(statisticsService.getKeyCount(mockProject)).toBe(2);
  });

  test("getSlotsCount returns keys × languages", () => {
    expect(statisticsService.getSlotsCount(mockProject)).toBe(4);
  });

  test("getEmptySlots returns per-language empty counts", () => {
    const result = statisticsService.getEmptySlots(mockProject);
    expect(result).toEqual({ en: 1, fr: 1 });
  });

  test("getEmptySlotsCount returns total empty slots", () => {
    expect(statisticsService.getEmptySlotsCount(mockProject)).toBe(2);
  });

  test("getTranslatedProgress calculates and sets progress", async () => {
    const progress = await statisticsService.getTranslatedProgress(mockProject);
    expect(progress).toBe(50); // (4 - 2) / 4 = 50%
  });

  test("getTranslatedProgress handles zero slots", async () => {
    const emptyProject = new Project({
      name: "empty",
      folder: "/folder",
      languages: [{ code: "en", base: true }],
      translation: { en: { data: [] } },
      getDefaultTranslation: () => ({ data: [] }),
    });

    const progress = await statisticsService.getTranslatedProgress(
      emptyProject
    );
    expect(progress).toBe(100);
  });
});
