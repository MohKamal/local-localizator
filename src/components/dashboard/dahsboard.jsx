import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NewProjectModal from '../project/new-project-modal';
import { useProject } from '../../providers/project.provider';
import { useI18n } from '../../providers/i18n.provider';
import { useView } from '../../providers/view.provider';
import projectService from '../../services/project.service';
import ProjectDetails from '../project/project-details';
import DashboardMain from './components/dashboard-main';
import TopNav from './components/top-nav';
import FileSelection from './../import/file-selection';

const Dashboard = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { currentView, setCurrentView } = useView();
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(true);
  const { setSelectedProject } = useProject();
  const { setLanguage } = useI18n();
  const [editingProject, setEditingProject] = useState(null);

  const scanProjects = useCallback(async () => {
    try {
      const _projects = await projectService.scan();
      setProjects(_projects);
    } catch (err) {
      console.error('Failed to scan folder:', err);
    }
  }, []);

  useEffect(() => {
    scanProjects();
  }, [scanProjects, setLanguage]);

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowNewProjectModal(true);
  };

  const handleCreateNewProject = useCallback(
    async (project) => {
      if (!isCreating) {
        // Edit existing
        const updatedProjects = projects.map((p) =>
          p.id === project.id
            ? {
                ...p,
                ...project,
                ...(project.type !== 'custom' && {
                  structure: projectService.setStructureFromType(project.type),
                }),
              }
            : p
        );

        const updatedProject = updatedProjects.find((p) => p.id === project.id);
        await project.save();
        setProjects(updatedProjects);
        setSelectedProject(project);
      } else {
        // Create new
        await project.save();
        const newProjects = [...projects, project];
        setProjects(newProjects);
        setSelectedProject(project);
        setCurrentView('project-details');
      }
      setShowNewProjectModal(false);
    },
    [isCreating, projects, setSelectedProject, setCurrentView]
  );

  const handleLoad = useCallback(
    (project) => {
      setSelectedProject(project);
      setCurrentView('project-details');
    },
    [setSelectedProject, setCurrentView]
  );

  const handleEdit = useCallback((project) => {
    setEditingProject(project);
    setIsCreating(false);
    setShowNewProjectModal(true);
  }, []);

  const handleDeleteProject = useCallback(
    async (id) => {
      const projectToDelete = projects.find((p) => p.id === id);
      if (!projectToDelete) return;

      await projectService.delete(projectToDelete);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setShowNewProjectModal(false);
      setCurrentView('dashboard');
    },
    [projects, setCurrentView]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => {
          setShowNewProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleCreateNewProject}
        onDelete={handleDeleteProject}
        initialData={editingProject}
        isCreating={isCreating}
      />

      {/* Top Navigation */}
      <TopNav handleCreateNew={handleCreateNew} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <DashboardMain
              handleLoad={handleLoad}
              projects={projects}
              handleCreateNew={handleCreateNew}
            />
          )}
          {currentView === 'project-details' && (
            <ProjectDetails handleEdit={handleEdit} />
          )}
          {currentView === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
            >
              <FileSelection projects={projects} setProjects={setProjects} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
