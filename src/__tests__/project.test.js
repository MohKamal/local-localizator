import { Project } from "../models/project";

// Mock dependencies
jest.mock("../pipes/PipeConvertStringsToObjects", () => {
  return {
    PipeConvertStringsToObjects: jest.fn().mockImplementation(() => ({
      convert: () => ({
        value: {
          getAllEntries: () => [
            { id: "1", key: "hello", value: "Hello World", tags: [], description: "" }
          ]
        }
      })
    }))
  };
});

jest.mock("../pipes/PipeFlatObjectToNestedObject", () => {
  return jest.fn().mockImplementation((obj) => ({
    unflatten: () => ({ value: obj })
  }));
});

jest.mock("../pipes/PipeStringToFilename", () => {
  return {
    PipeStringToFilename: jest.fn().mockImplementation((str) => ({
      safe: () => ({ value: str.replace(/[^a-z0-9]/g, "_") })
    }))
  };
});

describe("Project", () => {
  const baseLang = { code: "en", name: "English", base: true };
  const langs = [baseLang, { code: "fr", name: "French", base: false }];

  test("constructs successfully with valid input", () => {
    const project = new Project({
      name: "Test Project",
      folder: "/test",
      languages: langs,
    });

    expect(project.name).toBe("Test Project");
    expect(project.folder).toBe("/test");
    expect(project.languages.length).toBe(2);
    expect(project.id).toBeTruthy();
  });

  test("throws if name is missing", () => {
    expect(() => new Project({ folder: "/test", languages: langs })).toThrow("name is required");
  });

  test("throws if folder is missing", () => {
    expect(() => new Project({ name: "Test", languages: langs })).toThrow("folder path is required");
  });

  test("throws if no languages provided", () => {
    expect(() => new Project({ name: "Test", folder: "/test", languages: [] })).toThrow("At least one language is required");
  });

  test("generates slug correctly", () => {
    const project = new Project({ name: "My Project!", folder: "/test", languages: langs });
    expect(project.slug).toMatch(/^[a-z0-9]+_my-project$/);
  });

  test("ensures base language if none provided", () => {
    const langsNoBase = [{ code: "en", name: "English" }, { code: "fr", name: "French" }];
    const project = new Project({ name: "Test", folder: "/test", languages: langsNoBase });
    expect(project.languages[0].base).toBe(true);
    expect(project.languages[1].base).toBe(false);
  });

  test("getFilename returns safe filename", () => {
    const project = new Project({ name: "Test Project", folder: "/test", languages: langs });
    expect(project.getFilename()).toMatch(/^[a-z0-9_]+\.prj$/);
  });

  test("createKey adds key to all languages", () => {
    const project = new Project({ name: "Test", folder: "/test", languages: langs });
    project.createKey("greeting", "A greeting", { en: "Hi", fr: "Salut" });

    const enData = project.translation.en.data.find(k => k.key === "greeting");
    const frData = project.translation.fr.data.find(k => k.key === "greeting");

    expect(enData.value).toBe("Hi");
    expect(frData.value).toBe("Salut");
    expect(project.stats.lastEditedKey).toBe("greeting");
  });

  test("updateKey updates existing key", () => {
    const project = new Project({ name: "Test", folder: "/test", languages: langs });
    project.createKey("old", "desc");
    project.updateKey("old", "new desc", "new", { en: "Hello" });

    const enData = project.translation.en.data.find(k => k.key === "new");
    expect(enData).toBeTruthy();
    expect(enData.description).toBe("new desc");
    expect(enData.value).toBe("Hello");
  });

  test("deleteKeyBySetOfKeys removes keys", async () => {
    const project = new Project({ name: "Test", folder: "/test", languages: langs });
    project.createKey("toDelete", "desc");
    project.createKey("keep", "desc");

    await project.deleteKeyBySetOfKeys(new Set(["toDelete"]));
    expect(project.translation.en.data.some(k => k.key === "toDelete")).toBe(false);
    expect(project.translation.en.data.some(k => k.key === "keep")).toBe(true);
  });

  test("getDefaultTranslation returns base language", () => {
    const project = new Project({ name: "Test", folder: "/test", languages: langs });
    const defaultTrans = project.getDefaultTranslation();
    expect(defaultTrans.language.code).toBe("en");
  });
});