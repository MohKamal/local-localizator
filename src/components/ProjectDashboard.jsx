import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  FolderOpen,
  Eye,
  Play,
  Clock,
  FileText,
  ChevronLeft,
  Globe,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewProjectModal from "./NewProjectModal";
import FileSelection from "./FileSelection";
import TranslationTable from "./TranslationTable";
import { useProject } from "../providers/project.provider";
import { useI18n } from "../providers/i18n.provider";
import projectService from "../services/project.service";
import statisticsService from "../services/statistics.service";

const ProjectDashboard = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'project-details'
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(true);
  const { selectedProject, setSelectedProject } = useProject();
  const { t, language, setLanguage } = useI18n();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(undefined);
  const [rerender, setRerender] = useState(false);
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  useEffect(() => {
    const scanFolder = async () => {
      try {
        const _projects = await projectService.scanProjects();
        setProjects(_projects);
      } catch (err) {
        console.error("Failed to scan folder:", err);
      }
    };

    scanFolder();
    setLanguage("en");
  }, []); // Empty dependency = runs once on mount

  const handleCreateNew = (e) => {
    setShowNewProjectModal(true);
    setIsCreating(true);
  };

  const handleCreateNewProject = async (project) => {
    if (!isCreating) {
      const proj = projects.find((x) => x.id === project.id);
      if (proj) {
        proj.name = project.name;
        proj.lastModified = project.lastModified;
        proj.type = project.type;
        proj.description = project.description;
        proj.folder = project.folder;
        proj.slug = project.slug;
        proj.folder = project.folder;
        proj.selectedLanguages = project.selectedLanguages;
        proj.objectStructureType = project.objectStructureType;
        proj.translation = project.translation;
        proj.structure = project.structure;
        proj.setStructreFromType(project.type);
        await proj.save();
        setSelectedProject(proj);
      }
    } else {
      setProjects([...projects, project]);
      await project.save();
      setSelectedProject(project);
      setCurrentView("project-details");
    }
    setRerender(!rerender);
  };

  const handleload = async (project) => {
    setSelectedProject(project);
    setCurrentView("project-details");
  };

  const handlesave = async () => {
    await selectedProject.save();
    setRerender(!rerender);
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    // setSelectedProject(null);
  };

  const handleFileImportClick = () => {
    setCurrentView("import");
  };

  const handleFileImport = (e) => {
    setCurrentView("project-details");
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsCreating(false);
    setShowNewProjectModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "missing":
        return "bg-red-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FileText className="w-4 h-4" />;
      case "missing":
        return <Clock className="w-4 h-4" />;
      case "paused":
        return <Play className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleDeleteProject = async (id) => {
    const project = projects.find((p) => p.id === id);
    await projectService.delete(project);
    setProjects(projects.filter((p) => p.id !== id));
    setShowNewProjectModal(false);
    setCurrentView("dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => {
          setShowNewProjectModal(false);
        }}
        onSave={handleCreateNewProject}
        onDelete={handleDeleteProject}
        initialData={editingProject}
        isCreating={isCreating}
      />

      {/* Top Navigation */}
      <nav className="top-nav bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {currentView !== "dashboard" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToDashboard}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {currentView !== "dashboard"
                  ? selectedProject?.name
                  : "Local Localizator - Dashboard"}
              </h1>
            </div>

            {currentView === "dashboard" && (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFileImportClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t("button.import.project")}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNew}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("button.new.project")}</span>
                </motion.button>

                {/* Language Selector */}
                <div>
                  <button
                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {languages.find((x) => x.code === language)?.flag}{" "}
                      {languages.find((x) => x.code === language)?.name}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isLanguageMenuOpen && (
                    <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                            language === lang.code
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:text-gray-900"
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("dashboard.title")}
                </h2>
                <p className="text-gray-600">{t("dashboard.slogan")}</p>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("dashboard.no.project")}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t("dashboard.no.project.slogan")}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t("dashboard.create.project.button")}
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 min-w-0 truncate">
                            {project.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 min-w-0 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">
                            {project.status}
                          </span>
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{t("dashboard.project_card.translated")}</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span>
                            {t("dashboard.project_card.keys")}:{" "}
                            {statisticsService.getKeyCount(project)}
                          </span>
                        </div>
                        <span>
                          {t("dashboard.project_card.last_modified")}:{" "}
                          {project.getLastModifiedAsString()}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleload(project)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>
                          {t("dashboard.project_card.view_project_button")}
                        </span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {currentView === "project-details" && (
            <motion.div
              key="project-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
            >
              {selectedProject && (
                <>
                  <div className="flex justify-end space-x-4 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={handlesave}
                    >
                      {t("project_details.button.save")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleEdit(selectedProject);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("project_details.button.edit")}
                    </motion.button>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedProject.name}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {selectedProject.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedProject.status
                      )}`}
                    >
                      {getStatusIcon(selectedProject.status)}
                      <span className="ml-1 capitalize">
                        {selectedProject.status}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {t("project_details.title.project_details")}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {t("project_details.title.languages")}:
                            </span>
                            <span className="font-medium">
                              {selectedProject.selectedLanguages
                                .map((lang) => {
                                  return lang.name;
                                })
                                .join(", ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Keys:</span>
                            <span className="font-medium">
                              {statisticsService.getKeyCount(selectedProject)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {t("project_details.title.missing_slots")}:
                            </span>
                            <span className="font-medium">
                              {selectedProject.emptySlots}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {t("dashboard.project_card.last_modified")}:
                            </span>
                            <span className="font-medium">
                              {selectedProject.getLastModifiedAsString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {t("project_details.title.progress")}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{t("project_details.title.completion")}</span>
                            <span>{selectedProject.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                              style={{
                                width: `${selectedProject.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {t("project_details.title.recent_activity")}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t("project_details.title.project_created")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedProject.getCreatedAtAsString()}
                            </p>
                          </div>
                        </div>

                        {selectedProject.stats.lastEditedKey && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {t("project_details.title.last_edited_key")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedProject.stats.lastEditedKey} At{" "}
                                {selectedProject.getLastEditedKeyAttAsString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedProject.emptySlots > 0 && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {t("project_details.title.missing_translations")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedProject.emptySlotsAsString}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedProject.status === "active" && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Processing in progress
                              </p>
                              <p className="text-xs text-gray-500">
                                Currently active
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <TranslationTable />
                </>
              )}
            </motion.div>
          )}

          {currentView === "import" && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
            >
              <FileSelection onFilesSelected={handleFileImport} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProjectDashboard;
