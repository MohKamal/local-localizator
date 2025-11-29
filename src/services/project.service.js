import { Project } from '../models/project';
import { PipeConvertStringsToObjects } from '../pipes/PipeConvertStringsToObjects';
import predefinedLanguages from '../utils/languages';

class ProjectService {
  /**
   * Saves a project to disk as a JSON file.
   * @param {Project} project - The project instance to save.
   * @returns {Promise<void>}
   */
  async save(project) {
    if (!(project instanceof Project)) {
      console.error('Invalid project instance');
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
      console.log('Invalid project object');
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
      const files = items.filter((item) => item.type === 'file');

      if (files.length === 0) return [];

      // Load all projects in parallel
      const projectPromises = files.map((file) => this.load(file.path));
      const projects = await Promise.allSettled(projectPromises);

      // Filter out failed loads (e.g., corrupted files)
      const validProjects = projects
        .filter((result) => result && result.value)
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      // Optional: Log errors for failed loads
      projects
        .filter((result) => result && result.value)
        .filter((result) => result.status === 'rejected')
        .forEach((result, i) => {
          console.warn(
            `Failed to load project ${files[i].path}:`,
            result.reason
          );
        });

      return validProjects;
    } catch (error) {
      console.error('Project scan failed:', error);
      return [];
    }
  }

  /**
   * Synchronizes translation keys across multiple language objects.
   *
   * @param {Array<{language_code: string, data: Object}>} langList - List of language objects
   * @param {string|function} [fallback='[MISSING]'] - Fallback value or function(key) => value
   * @returns {Array<{language_code: string, data: Object}>} - Updated list with synchronized keys
   */
  synchronizeTranslationKeys(langList, fallback = '') {
    // Collect all unique keys from all language data objects
    const allKeys = new Set();
    langList.forEach(({ data }) => {
      Object.keys(data).forEach((key) => allKeys.add(key));
    });

    // Optionally sort keys for consistent ordering (helps with diffs)
    const sortedKeys = Array.from(allKeys).sort();

    // Build fallback resolver
    const getFallback =
      typeof fallback === 'function' ? fallback : () => fallback;

    // Return new list with synchronized data
    return langList.map(({ language_code, data, base }) => {
      const syncedData = {};
      sortedKeys.forEach((key) => {
        syncedData[key] = data.hasOwnProperty(key)
          ? data[key]
          : getFallback(key);
      });
      return { language_code, data: syncedData, base };
    });
  }

  getDirectoryFromPath(fullPath) {
    // Handle both forward slashes (/) and backslashes (\)
    const normalizedPath = fullPath.replace(/\\/g, '/');
    const lastSlashIndex = normalizedPath.lastIndexOf('/');

    if (lastSlashIndex === -1) {
      return ''; // No directory separator found
    }

    return normalizedPath.substring(0, lastSlashIndex);
  }

  async createProjectFromTranslationFiles(files_data = []) {
    if (files_data.length <= 0) return undefined;
    let folder = '';
    const languages_content = [];
    await new Promise((resolve) => {
      let index = 0;
      files_data.forEach(async (file_data) => {
        folder = this.getDirectoryFromPath(file_data.path);
        const content = await window.electronAPI.readFile(file_data.path);
        if (content)
          languages_content.push({
            data: JSON.parse(content),
            language_code: file_data.code,
            base: file_data.base,
          });
        index++;
        if (index >= files_data.length) resolve();
      });
    });
    if (languages_content.length > 0) {
      const translate = this.synchronizeTranslationKeys(languages_content);
      const languages = [];
      const translation = {};
      translate.forEach((tr) => {
        const lang = predefinedLanguages.find(
          (x) => x.code === tr.language_code
        );
        languages.push(lang);
        if (!translation[tr.language_code]) {
          translation[tr.language_code] = {
            language: lang,
            data: new PipeConvertStringsToObjects(tr.data)
              .convert()
              .value.getAllEntries(),
          };
        }
      });

      return new Project({
        name: `[From Files] ${this.generateRandomName()}`,
        type: 'react',
        languages: languages,
        translation: translation,
        initialize: true,
        folder: folder,
      });
    }
  }

  generateRandomName() {
    const adjectives = [
      'Mighty',
      'Clever',
      'Silent',
      'Brave',
      'Golden',
      'Swift',
      'Hidden',
      'Lucky',
    ];
    const nouns = [
      'Tiger',
      'Rocket',
      'Comet',
      'Phoenix',
      'Shadow',
      'Echo',
      'Star',
      'Ninja',
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj}${noun}`;
  }
}

// Singleton export
const projectService = new ProjectService();
export default projectService;
