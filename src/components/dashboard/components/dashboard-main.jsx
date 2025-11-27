import { FolderOpen, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../../../providers/i18n.provider";
import statisticsService from "../../../services/statistics.service";
import getStatusIcon from "../../shared/get-status-icon";
import getStatusColor from "../../shared/get-status-color";
import { useCallback, memo } from "react";

const ProjectCard = memo(({ project, onOpen, t }) => {
  const keyCount = statisticsService.getKeyCount(project);
  const lastModified = project.getLastModifiedAsString();
  const statusColor = getStatusColor(project.status);
  const statusIcon = getStatusIcon(project.status);

  return (
    <motion.div
      key={project.id}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {project.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description || t("dashboard.project_card.no_description")}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusIcon}
          <span className="ml-1 capitalize">{project.status}</span>
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{t("dashboard.project_card.translated")}</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, Math.max(0, project.progress))}%`,
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>
          {t("dashboard.project_card.keys")}: {keyCount}
        </span>
        <span>
          {t("dashboard.project_card.last_modified")}: {lastModified}
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onOpen(project)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label={`${t("dashboard.project_card.view_project_button")} ${
          project.name
        }`}
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        <span>{t("dashboard.project_card.view_project_button")}</span>
      </motion.button>
    </motion.div>
  );
});

ProjectCard.displayName = "ProjectCard";

const DashboardMain = ({ handleLoad, handleCreateNew, projects }) => {
  const { t } = useI18n();

  const handleProjectOpen = useCallback(
    (project) => handleLoad(project),
    [handleLoad]
  );

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
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
            <FolderOpen
              className="w-12 h-12 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("dashboard.no.project")}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t("dashboard.no.project.slogan")}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label={t("dashboard.create.project.button")}
          >
            {t("dashboard.create.project.button")}
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={handleProjectOpen}
                t={t}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardMain;