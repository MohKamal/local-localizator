import { Project } from "../models/project";

class ProjectService {
  async save(project) {
    await window.electronAPI.saveData(
      JSON.stringify(project),
      project.getFilename()
    );
  }

  async load(filename) {
    const data = await window.electronAPI.loadData(filename);
    const project_data = JSON.parse(data);
    const project = new Project(
      project_data.id,
      new Date(project_data.lastModified),
      new Date(project_data.createdAt),
      project_data.name,
      project_data.slug,
      project_data.type,
      project_data.objectType,
      project_data.folder,
      project_data.description,
      project_data.structure,
      project_data.selectedLanguages,
      project_data.translation,
      project_data.stats,
      false
    );
    await project.calculation();
    return project;
  }

  async delete(project) {
    await window.electronAPI.deleteProject(project.getFilename());
  }

  async scanProjects() {
    const projects_files = await window.electronAPI.scanProject();
    const projects = [];
    await new Promise((resolve) => {
      let index = 0;
      const files = projects_files.filter((x) => x.type === "file");
      files.forEach(async (file) => {
        projects.push(await projectService.load(file.path));
        index++;
        if (index >= files.length) resolve();
      });
    });

    return projects;
  }
}

const projectService = new ProjectService();
export default projectService;
