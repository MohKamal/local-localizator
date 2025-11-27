import { useState, useCallback, useMemo } from 'react';
import {
  X,
  Folder,
  Languages,
  Plus,
  Flag,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { Project } from '../../models/project';
import predefinedLanguages from '../../utils/languages';
import projectStructureOptions from '../../utils/projectStructures';
import DeleteConfirmation from './components/delete-confirmation-modal';

const NewProjectModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isCreating = true,
}) => {
  const [projectName, setProjectName] = useState(initialData?.name || '');
  const [projectType, setProjectType] = useState(initialData?.type || 'react');
  const [structure, setStructure] = useState(initialData?.structure || '');
  const [projectFolder, setProjectFolder] = useState(initialData?.folder || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [languages, setLanguages] = useState(initialData?.languages || []);
  const [objectStructureType, setObjectStructureType] = useState(
    initialData?.objectStructureType || 'flated'
  );

  const [customLanguage, setCustomLanguage] = useState({ name: '', code: '' });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});

  const isValidFolderPathSyntax = useCallback((input) => {
    if (typeof input !== 'string' || !input.trim()) return false;
    const path = input.trim();
    if (/[\x00-\x1f\x7f<>:"|?*]/.test(path)) return false;
    if (path.includes('../') || path.includes('..\\')) return false;
    return true;
  }, []);

  const validateProjectName = useCallback((name) => {
    return /^[a-zA-Z0-9_ ]*$/.test(name);
  }, []);

  const isCustomProject = projectType === 'custom';
  const hasProjectFolder = projectFolder.trim() !== '';
  const currentBaseLanguage = useMemo(
    () => languages.find((lang) => lang.base) || languages[0],
    [languages]
  );

  const ensureBaseLanguage = useCallback((langs) => {
    if (langs.length === 0) return langs;
    const hasBase = langs.some((lang) => lang.base);
    if (hasBase) return langs;
    return langs.map((lang, i) => ({ ...lang, base: i === 0 }));
  }, []);

  if (languages.length > 0 && !languages.some((l) => l.base)) {
    setLanguages((prev) => ensureBaseLanguage(prev));
  }

  const handleLanguageToggle = useCallback(
    (language) => {
      setLanguages((prev) => {
        const exists = prev.find((lang) => lang.code === language.code);
        let updated = exists
          ? prev.filter((lang) => lang.code !== language.code)
          : [...prev, { ...language, base: prev.length === 0 }];
        return ensureBaseLanguage(updated);
      });
    },
    [ensureBaseLanguage]
  );

  const removeLanguage = useCallback(
    (code) => {
      setLanguages((prev) => {
        const updated = prev.filter((lang) => lang.code !== code);
        return ensureBaseLanguage(updated);
      });
    },
    [ensureBaseLanguage]
  );

  const isLanguageSelected = useCallback(
    (code) => languages.some((lang) => lang.code === code),
    [languages]
  );

  const handleBaseLanguageChange = useCallback((newBaseLanguage) => {
    setLanguages((prev) =>
      prev.map((lang) => ({
        ...lang,
        base: lang.code === newBaseLanguage.code,
      }))
    );
    setIsDropdownOpen(false);
  }, []);

  const setProjectFolderManually = useCallback(
    (folder) => {
      setProjectFolder(folder);
      if (isValidFolderPathSyntax(folder)) {
        setErrors((e) => ({ ...e, folder: '' }));
      }
    },
    [isValidFolderPathSyntax]
  );

  const handleOpenFolder = useCallback(async () => {
    try {
      const folder = await window.electronAPI?.openFolderDialog?.();
      if (folder) setProjectFolderManually(folder);
    } catch (err) {
      console.error('Failed to open folder dialog:', err);
    }
  }, [setProjectFolderManually]);

  const handleCustomLanguageSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const name = customLanguage.name.trim();
      const code = customLanguage.code.trim().toLowerCase();

      let error = '';
      if (!name) error = 'Language name is required';
      else if (!code) error = 'Language code is required';
      else if (code.length > 10)
        error = 'Language code must be 10 characters or less';
      else if (/[^a-zA-Z0-9-_]/.test(code))
        error =
          'Language code can only contain letters, numbers, hyphens, and underscores';
      else if (
        languages.some((l) => l.code.toLowerCase() === code) ||
        predefinedLanguages.some((l) => l.code.toLowerCase() === code)
      ) {
        error = 'Language code already exists';
      }

      if (error) {
        setErrors((prev) => ({ ...prev, customLanguage: error }));
        return;
      }

      const newLang = {
        name,
        code,
        isCustom: true,
        base: languages.length === 0,
      };
      setLanguages((prev) => ensureBaseLanguage([...prev, newLang]));
      setCustomLanguage({ name: '', code: '' });
      setShowCustomForm(false);
      setErrors((prev) => ({ ...prev, customLanguage: '' }));
    },
    [customLanguage, languages, ensureBaseLanguage]
  );

  const clearError = useCallback((field) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateAndSubmit = useCallback(async () => {
    const newErrors = {};

    if (!projectName.trim()) newErrors.name = 'Project name is required';
    else if (!validateProjectName(projectName))
      newErrors.name = 'Only letters, numbers, spaces, and underscores allowed';

    if (!projectFolder.trim()) newErrors.folder = 'Project folder is required';
    else if (!isValidFolderPathSyntax(projectFolder))
      newErrors.folder =
        'Invalid folder path. Avoid special characters like < > : " | ? *';

    if (languages.length === 0)
      newErrors.languages = 'You need to select at least one language.';

    if (isCustomProject && hasProjectFolder && !structure.trim()) {
      newErrors.structure =
        'When choosing custom project, you need to set files saving regex.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const project = new Project({
      id: isCreating ? undefined : initialData?.id,
      createdAt: isCreating ? undefined : new Date(initialData?.createdAt),
      slug: isCreating ? undefined : initialData?.slug,
      stats: isCreating ? undefined : initialData?.stats,
      translation: isCreating ? {} : initialData?.translation,
      name: projectName.trim(),
      type: projectType,
      objectType: objectStructureType,
      folder: projectFolder.trim(),
      description: description.trim(),
      structure:
        isCustomProject && hasProjectFolder ? structure.trim() : undefined,
      languages: ensureBaseLanguage([...languages]),
      initialize: false,
    });

    onClose();
    await onSave(project);
  }, [
    projectName,
    projectFolder,
    structure,
    description,
    projectType,
    objectStructureType,
    languages,
    isCreating,
    initialData,
    isCustomProject,
    hasProjectFolder,
    onClose,
    onSave,
    validateProjectName,
    isValidFolderPathSyntax,
    ensureBaseLanguage,
  ]);

  const handleDelete = useCallback(() => {
    if (initialData?.id) {
      onDelete(initialData.id);
    }
    setShowDeleteModal(false);
    onClose();
  }, [initialData, onDelete, onClose]);

  const handleDeleteConfirmation = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirmationCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onDelete={handleDelete}
        onCancel={handleDeleteConfirmationCancel}
      />

      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {isCreating
                ? 'Create New Project'
                : `Editing: ${initialData?.name || ''}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Project Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectName(val);
                  if (!validateProjectName(val)) {
                    setErrors((prev) => ({
                      ...prev,
                      name: 'Only letters, numbers, spaces, and underscores allowed',
                    }));
                  } else {
                    clearError('name');
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" /> {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
              />
            </div>

            {/* Project Folder */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Folder
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectFolder}
                  onChange={(e) => setProjectFolderManually(e.target.value)}
                  onClick={handleOpenFolder}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.folder ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Click to select folder or paste path"
                />
                <Folder
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              {errors.folder && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" /> {errors.folder}
                </p>
              )}
            </div>

            {/* Project Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Project Type
              </label>
              <div className="flex flex-wrap gap-4">
                {projectStructureOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="projectType"
                      checked={projectType === option.value}
                      onChange={() => setProjectType(option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Structure Input (Custom Only) */}
            {isCustomProject && hasProjectFolder && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Files Naming Structure
                </label>
                <input
                  type="text"
                  value={structure}
                  onChange={(e) => {
                    setStructure(e.target.value);
                    if (e.target.value.trim()) clearError('structure');
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.structure ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., /{lang}/local.json"
                />
                {errors.structure && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-1" /> {errors.structure}
                  </p>
                )}
              </div>
            )}

            {!isCustomProject && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
                Project structure customization is only available for{' '}
                <strong>Custom</strong> projects.
              </div>
            )}

            {/* Object Structure Type */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Select File Structure
              </h2>
              <p className="text-slate-600">
                Choose between Flated or Nested structure
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {['flated', 'nested'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    objectStructureType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="objectStructure"
                    checked={objectStructureType === type}
                    onChange={() => setObjectStructureType(type)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-slate-800 capitalize">
                      {type}
                    </span>
                    <p className="text-slate-600 text-sm mt-1">
                      {type === 'flated'
                        ? 'Flat, single-level structure'
                        : 'Hierarchical, multi-level structure'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Language Section */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <Languages
                  className="h-10 w-10 text-indigo-600 mx-auto mb-3"
                  aria-hidden="true"
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Language Selection
                </h2>
                <p className="text-gray-600">
                  Choose your preferred languages or add custom ones
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {languages.length} language{languages.length !== 1 ? 's' : ''}{' '}
                  selected
                </p>
              </div>

              {errors.languages && (
                <p className="text-red-600 text-sm mb-4 flex items-center justify-center">
                  <X className="w-4 h-4 mr-1" /> {errors.languages}
                </p>
              )}

              {/* Base Language */}
              {languages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {currentBaseLanguage.flag && (
                        <span className="text-2xl">
                          {currentBaseLanguage.flag}
                        </span>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Current Base Language
                        </h3>
                        <p className="text-gray-600">
                          {currentBaseLanguage.name} (
                          {currentBaseLanguage.code.toUpperCase()})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg"
                    >
                      <span>Change</span>
                      <ChevronsUpDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {isDropdownOpen && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Select New Base Language
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        onClick={() => handleBaseLanguageChange(lang)}
                        className={`p-4 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          lang.base ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {lang.flag && (
                            <span className="text-xl">{lang.flag}</span>
                          )}
                          <div>
                            <div className="font-medium">{lang.name}</div>
                            <div className="text-sm text-gray-500">
                              {lang.code.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        {lang.base && (
                          <Check
                            className="w-5 h-5 text-green-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Languages */}
              {languages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Selected Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm"
                      >
                        {lang.flag ? (
                          <span className="mr-1.5 text-lg">{lang.flag}</span>
                        ) : lang.isCustom ? (
                          <Flag
                            className="w-4 h-4 mr-1.5 text-indigo-600"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="mr-2">
                          {lang.name} ({lang.code})
                        </span>
                        <button
                          onClick={() => removeLanguage(lang.code)}
                          className="text-indigo-600 hover:text-indigo-900"
                          aria-label={`Remove ${lang.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Languages */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Available Languages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {predefinedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`p-3 rounded-lg border text-left transition ${
                        isLanguageSelected(lang.code)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {lang.code}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Language Form */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Add Custom Language
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {showCustomForm ? 'Cancel' : 'Add'}
                  </button>
                </div>

                {showCustomForm && (
                  <form
                    onSubmit={handleCustomLanguageSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language Name *
                      </label>
                      <input
                        type="text"
                        value={customLanguage.name}
                        onChange={(e) =>
                          setCustomLanguage({
                            ...customLanguage,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language Code *
                      </label>
                      <input
                        type="text"
                        value={customLanguage.code}
                        onChange={(e) =>
                          setCustomLanguage({
                            ...customLanguage,
                            code: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Letters, numbers, hyphens, underscores only (max 10
                        chars)
                      </p>
                    </div>
                    {errors.customLanguage && (
                      <p className="text-red-600 text-sm">
                        {errors.customLanguage}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        Add Custom Language
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-5 border-t border-gray-200 bg-gray-50">
            {!isCreating && (
              <button
                type="button"
                onClick={handleDeleteConfirmation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            )}
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={validateAndSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
              >
                {isCreating ? 'Create Project' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewProjectModal;
