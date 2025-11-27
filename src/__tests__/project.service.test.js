import projectService from "../services/project.service";
import { Project } from "../models/project";

// Mock Electron API
const mockSaveData = jest.fn();
const mockLoadData = jest.fn();
const mockDeleteProject = jest.fn();
const mockScanProject = jest.fn();

window.electronAPI = {
  saveData: mockSaveData,
  loadData: mockLoadData,
  deleteProject: mockDeleteProject,
  scanProject: mockScanProject,
  pathJoin: jest.fn((a, b) => `${a}/${b}`),
};

// Mock Project class methods
jest.spyOn(Project.prototype, "calculation").mockResolvedValue();

describe("ProjectService", () => {
  const mockProject = new Project({
    getFilename: () => "test.prj",
    name: "Test",
    folder: "/test",
    languages: [{ code: "en", base: true }],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("load parses and reconstructs project", async () => {
    const mockData = JSON.stringify({
      name: "Loaded Project",
      folder: "/loaded",
      languages: [{ code: "en", base: true }],
      createdAt: "2023-01-01T00:00:00.000Z",
      lastModified: "2023-01-02T00:00:00.000Z",
      stats: {
        lastEditedKey: "key",
        lastEditedKeyAt: "2023-01-02T00:00:00.000Z",
      },
    });

    mockLoadData.mockResolvedValue(mockData);

    const project = await projectService.load("test.prj");

    expect(project.name).toBe("Loaded Project");
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.stats.lastEditedKeyAt).toBeInstanceOf(Date);
    expect(Project.prototype.calculation).toHaveBeenCalled();
  });

  test("delete calls Electron delete", async () => {
    await projectService.delete(mockProject);
    expect(mockDeleteProject).toEqual(expect.not.stringContaining("test.prj"));
  });

  test("scan loads all valid project files", async () => {
    mockScanProject.mockResolvedValue([
      { type: "file", path: "p1.prj" },
      { type: "file", path: "p2.prj" },
      { type: "dir", path: "folder" },
    ]);

    mockLoadData.mockImplementation((path) =>
      Promise.resolve(
        JSON.stringify({
          name: path.replace(".prj", ""),
          folder: "/test",
          languages: [{ code: "en", base: true }],
        })
      )
    );

    const projects = await projectService.scan();

    expect(projects.length).toBe(2);
    expect(projects[0].name).toBe("p1");
    expect(projects[1].name).toBe("p2");
  });

  test("scan skips corrupted files", async () => {
    mockScanProject.mockResolvedValue([{ type: "file", path: "bad.prj" }]);
    mockLoadData.mockResolvedValue("NOT JSON");

    const projects = await projectService.scan();
    expect(projects.length).toBe(0);
  });
});
