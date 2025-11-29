import { motion, AnimatePresence } from 'framer-motion';
import TranslationTable from './components/translation-table';
import statisticsService from '../../services/statistics.service';
import getStatusColor from '../shared/get-status-color';
import getStatusIcon from '../shared/get-status-icon';
import { useProject } from '../../providers/project.provider';
import { useI18n } from '../../providers/i18n.provider';
import { useCallback, useMemo } from 'react';

const ProjectDetails = ({ handleEdit }) => {
  const { selectedProject } = useProject();
  const { t } = useI18n();

  const handleSave = useCallback(async () => {
    if (selectedProject) {
      await selectedProject.save();
    }
  }, [selectedProject]);

  const projectData = useMemo(() => {
    if (!selectedProject) return null;

    const languages = selectedProject.languages
      .map((lang) => lang.name)
      .join(', ');

    const keyCount = statisticsService.getKeyCount(selectedProject);
    const emptySlots = selectedProject.emptySlots || 0;
    const progress = Math.min(100, Math.max(0, selectedProject.progress));

    return {
      languages,
      keyCount,
      emptySlots,
      progress,
      createdAt: selectedProject.getCreatedAtAsString(),
      lastModified: selectedProject.getLastModifiedAsString(),
      lastEditedKey: selectedProject.stats?.lastEditedKey,
      lastEditedAt: selectedProject.getLastEditedKeyAttAsString?.(),
      emptySlotsAsString: selectedProject.emptySlotsAsString,
      status: selectedProject.status,
    };
  }, [selectedProject]);

  if (!selectedProject || !projectData) {
    return (
      <motion.div
        key="project-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center text-gray-500"
      >
        {t('project_details.loading')}
      </motion.div>
    );
  }

  const statusIcon = getStatusIcon(projectData.status);
  const statusColor = getStatusColor(projectData.status);

  return (
    <motion.div
      key="project-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
    >
      <div className="flex justify-end space-x-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label={t('project_details.button.save')}
        >
          {t('project_details.button.save')}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleEdit(selectedProject)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label={`${t('project_details.button.edit')} ${
            selectedProject.name
          }`}
        >
          {t('project_details.button.edit')}
        </motion.button>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedProject.name}
          </h2>
          <p className="text-gray-600 text-lg line-clamp-2">
            {selectedProject.description || t('project_details.no_description')}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
        >
          {statusIcon}
          <span className="ml-1 capitalize">{projectData.status}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Project Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('project_details.title.project_details')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('project_details.title.languages')}:
                </span>
                <span className="font-medium">{projectData.languages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('project_details.title.total_keys')}:
                </span>
                <span className="font-medium">{projectData.keyCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('project_details.title.missing_slots')}:
                </span>
                <span className="font-medium">{projectData.emptySlots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t('dashboard.project_card.last_modified')}:
                </span>
                <span className="font-medium">{projectData.lastModified}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('project_details.title.progress')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('project_details.title.completion')}</span>
                <span>{projectData.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${projectData.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  role="progressbar"
                  aria-valuenow={projectData.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('project_details.title.recent_activity')}
          </h3>
          <div className="space-y-4">
            <ActivityItem
              color="bg-blue-500"
              title={t('project_details.title.project_created')}
              detail={projectData.createdAt}
            />

            {projectData.lastEditedKey && (
              <ActivityItem
                color="bg-green-500"
                title={t('project_details.title.last_edited_key')}
                detail={`${projectData.lastEditedKey} At ${projectData.lastEditedAt}`}
              />
            )}

            {projectData.emptySlots > 0 && (
              <ActivityItem
                color="bg-red-500"
                title={t('project_details.title.missing_translations')}
                detail={projectData.emptySlotsAsString}
              />
            )}

            {projectData.status === 'active' && (
              <ActivityItem
                color="bg-purple-500"
                title="Processing in progress"
                detail="Currently active"
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <TranslationTable key={selectedProject.id} />
      </AnimatePresence>
    </motion.div>
  );
};

const ActivityItem = ({ color, title, detail }) => (
  <div className="flex items-start space-x-3">
    <div
      className={`w-2 h-2 ${color} rounded-full mt-2 flex-shrink-0`}
      aria-hidden="true"
    />
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  </div>
);

export default ProjectDetails;
