import { Project } from "../models/project";

class ProjectService {
  /**
   * Saves a project to disk as a JSON file.
   * @param {Project} project - The project instance to save.
   * @returns {Promise<void>}
   */
  async save(project) {
    if (!(project instanceof Project)) {
      console.error("Invalid project instance");
      return;
    }
    const data = JSON.stringify(project, null, 2); // Pretty-print for debugging
    await window.electronAPI.saveData(data, project.getFilename());
  }

  /**
   * Loads a project from a filename.
   * @param {string} filename - Full path to the project file.
   * @returns {Promise<Project>}
   */
  async load(filename) {
    try {
      const rawData = await window.electronAPI.loadData(filename);
      const parsed = JSON.parse(rawData);

      // Reconstruct dates
      const projectData = {
        ...parsed,
        lastModified: parsed.lastModified
          ? new Date(parsed.lastModified)
          : undefined,
        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : undefined,
        stats: parsed.stats
          ? {
              ...parsed.stats,
              lastEditedKeyAt: parsed.stats.lastEditedKeyAt
                ? new Date(parsed.stats.lastEditedKeyAt)
                : new Date(),
            }
          : undefined,
        initialize: false,
      };

      const project = new Project(projectData);
      await project.calculation();
      return project;
    } catch (error) {
      console.error(`Failed to load project from ${filename}:`, error);
    }
  }

  /**
   * Deletes a project file from disk.
   * @param {Project} project - The project to delete.
   * @returns {Promise<void>}
   */
  async delete(project) {
    if (!project?.getFilename) {
      console.log("Invalid project object");
      return;
    }
    await window.electronAPI.deleteProject(project.getFilename());
  }

  /**
   * Scans the project directory and loads all valid project files.
   * @returns {Promise<Project[]>}
   */
  async scan() {
    try {
      const items = await window.electronAPI.scanProject();
      const files = items.filter((item) => item.type === "file");

      if (files.length === 0) return [];

      // Load all projects in parallel
      const projectPromises = files.map((file) => this.load(file.path));
      const projects = await Promise.allSettled(projectPromises);

      // Filter out failed loads (e.g., corrupted files)
      const validProjects = projects
        .filter((result) => result && result.value)
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      // Optional: Log errors for failed loads
      projects
        .filter((result) => result && result.value)
        .filter((result) => result.status === "rejected")
        .forEach((result, i) => {
          console.warn(
            `Failed to load project ${files[i].path}:`,
            result.reason
          );
        });

      return validProjects;
    } catch (error) {
      console.error("Project scan failed:", error);
      return [];
    }
  }
}

// Singleton export
const projectService = new ProjectService();
export default projectService;
