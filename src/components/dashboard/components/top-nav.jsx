import { Plus, Upload, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../../../providers/project.provider';
import { useI18n } from '../../../providers/i18n.provider';
import LanguageSelector from './language-selector';
import { useView } from '../../../providers/view.provider';
import { useCallback } from 'react';

const TopNav = ({ handleCreateNew }) => {
  const { currentView, setCurrentView } = useView();
  const { selectedProject } = useProject();
  const { t } = useI18n();

  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, [setCurrentView]);

  const handleFileImportClick = useCallback(() => {
    setCurrentView('import');
  }, [setCurrentView]);

  const title =
    currentView === 'dashboard'
      ? t('nav.dashboard.title')
      : currentView === 'project-details'
        ? selectedProject?.name || t('nav.label.loading')
        : t('nav.dashboard.goback');

  return (
    <nav
      className="top-nav bg-white shadow-sm border-b border-gray-200"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Back button + Title */}
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {currentView !== 'dashboard' && (
                <motion.button
                  key="back-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToDashboard}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label={t('button.back.to.dashboard')}
                >
                  <ChevronLeft
                    className="w-5 h-5 text-gray-600"
                    aria-hidden="true"
                  />
                </motion.button>
              )}
            </AnimatePresence>

            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
              {title}
            </h1>
          </div>

          {/* Right: Actions (only on dashboard) */}
          {currentView === 'dashboard' && (
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFileImportClick}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>{t('button.import.project')}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{t('button.new.project')}</span>
              </motion.button>

              <LanguageSelector />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
