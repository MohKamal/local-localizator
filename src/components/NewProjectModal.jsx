import { useState, useRef } from "react";
import {
  X,
  Folder,
  Languages,
  Plus,
  Flag,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Project } from "../models/project";
import predefinedLanguages from "../utils/languages";
import projectStructureOptions from "../utils/projectStructures";
import DeleteConfirmation from "./DeleteConfirmation";

const NewProjectModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isCreating = true,
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState(initialData?.name || "");
  const [projectType, setProjectType] = useState(initialData?.type || "react");
  const [structure, setStructure] = useState(initialData?.structure || "");
  const [projectFolder, setProjectFolder] = useState(initialData?.folder || ""); // Simulated folder path
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [selectedLanguages, setSelectedLanguages] = useState(
    initialData?.selectedLanguages || []
  );
  const [objectStructureType, setObjectStructureType] = useState(
    initialData?.objectStructureType || "flated"
  );

  const [customLanguage, setCustomLanguage] = useState({ name: "", code: "" });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    type: "",
    folder: "",
    description: "",
    languages: "",
    structure: "",
  });

  const isValidFolderPathSyntax = (input) => {
    if (typeof input !== "string" || input.trim() === "") {
      return false;
    }

    const path = input.trim();

    // Disallow null bytes or control characters
    if (/[\x00-\x1f\x7f]/.test(path)) {
      return false;
    }

    // Disallow characters that are invalid in *most* filesystems
    // Especially important if your backend runs on Windows
    if (/[<>:"|?*]/.test(path)) {
      return false;
    }

    // Optional: Disallow path traversal (e.g., "../", "./")
    // Remove or adjust based on your needs
    if (
      /^\.{1,2}[\\/]/.test(path) ||
      /[\\/]\.{1,2}[\\/]/.test(path) ||
      /[\\/]$/.test(path + "/")
    ) {
      // This is a simplified check; you might want to allow relative paths
      // If you want to forbid parent directory access:
      if (path.includes("../") || path.includes("..\\")) {
        return false;
      }
    }

    // Allow forward slashes (Unix-style) and backslashes (Windows-style)
    // But you might standardize to forward slashes in your app
    return true;
  };

  const validateInput = (value) => {
    return /^[a-zA-Z0-9_ ]*$/.test(value);
  };

  const handleLanguageToggle = (language) => {
    if (selectedLanguages.find((lang) => lang.code === language.code)) {
      setSelectedLanguages(
        selectedLanguages.filter((lang) => lang.code !== language.code)
      );
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const addError = (field, message) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleCustomLanguageSubmit = (e) => {
    e.preventDefault();

    const error = "";
    if (!customLanguage.name.trim()) {
      error = "Language name is required";
    }
    if (!customLanguage.code.trim()) {
      error = "Language code is required";
    } else if (customLanguage.code.length > 10) {
      error = "Language code must be 10 characters or less";
    } else if (/[^a-zA-Z0-9-_]/.test(customLanguage.code)) {
      error =
        "Language code can only contain letters, numbers, hyphens, and underscores";
    }

    // Check if code already exists
    const existingLanguage = selectedLanguages.find(
      (lang) => lang.code.toLowerCase() === customLanguage.code.toLowerCase()
    );
    const existingPredefined = predefinedLanguages.find(
      (lang) => lang.code.toLowerCase() === customLanguage.code.toLowerCase()
    );

    if (existingLanguage || existingPredefined) {
      error = "Language code already exists";
    }

    addError("languages", error);

    if (!error) {
      const newCustomLanguage = {
        name: customLanguage.name.trim(),
        code: customLanguage.code.trim().toLowerCase(),
        isCustom: true,
      };

      setSelectedLanguages([...selectedLanguages, newCustomLanguage]);
      setCustomLanguage({ name: "", code: "" });
      setShowCustomForm(false);
      setErrors({});
    }
  };

  const removeLanguage = (code) => {
    setSelectedLanguages(
      selectedLanguages.filter((lang) => lang.code !== code)
    );
  };

  const isLanguageSelected = (code) => {
    return selectedLanguages.some((lang) => lang.code === code);
  };

  const handleSubmit = async () => {
    let error = false;
    if (selectedLanguages.length <= 0) {
      addError("languages", "You need to select at least one language.");
      error = true;
    } else addError("languages", "");

    if (!projectName) {
      addError("name", "No project name was provided");
      error = true;
    } else addError("name", "");

    if (!projectFolder) {
      addError("folder", "No project folder was provided");
      error = true;
    } else addError("folder", "");

    if (error) return;
    if (errors.name || errors.structure || errors.folder) return;

    let project = undefined;
    if (!isCreating) {
      project = new Project(
        initialData.id,
        undefined,
        new Date(initialData.createdAt),
        projectName,
        initialData.slug,
        projectType,
        objectStructureType,
        projectFolder,
        description,
        isCustomProject && hasProjectFolder ? structure : "",
        selectedLanguages,
        initialData.translation,
        initialData.stats,
        false
      );
    } else
      project = new Project(
        undefined,
        undefined,
        undefined,
        projectName,
        undefined,
        projectType,
        objectStructureType,
        projectFolder,
        description,
        isCustomProject && hasProjectFolder ? structure : undefined,
        selectedLanguages,
        {},
        undefined
      );
    onClose();
    onSave(project);
  };

  const handleOpenFolder = async () => {
    try {
      const folder = await window.electronAPI.openFolderDialog();
      if (folder) {
        setProjectFolderManualy(folder);
      }
    } catch (err) {
      console.error("Failed to open folder dialog:", err);
    }
  };

  const setProjectFolderManualy = (folder) => {
    setProjectFolder(folder);
  };

  const handleBaseLanguageChange = (newBaseLanguage) => {
    // Update the languages array
    const updatedLanguages = selectedLanguages.map((lang) => ({
      ...lang,
      base: lang.code === newBaseLanguage.code,
    }));

    setSelectedLanguages(updatedLanguages);
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    onDelete(initialData.id);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmationCancel = () => {
    setShowDeleteModal(false);
  };

  // Only show tree structure and add buttons when custom is selected
  const isCustomProject = projectType === "custom";
  const hasProjectFolder = projectFolder.trim() !== "";
  const currentBaseLanguage = selectedLanguages.find((lang) => lang.base);
  return (
    <>
      <DeleteConfirmation
        isOpen={showDeleteModal}
        onDelete={handleDelete}
        onCancel={handleDeleteConfirmationCancel}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {isCreating
                ? "Create New Project"
                : `Editing: ${initialData.name}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
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
                  if (!validateInput(e.target.value)) {
                    addError(
                      "name",
                      "Only letters, numbers, and underscores are allowed"
                    );
                  } else addError("name", "");
                  setProjectName(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
              />

              {errors["name"] && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors["name"]}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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
                  onChange={(e) => {
                    if (isValidFolderPathSyntax(e.target.value)) {
                      addError(
                        "folder",
                        ' Invalid folder path. Avoid special characters like < > : " | ?'
                      );
                    } else addError("folder", "");
                    setProjectFolderManualy(e.target.value);
                  }}
                  onClick={handleOpenFolder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                  placeholder="Enter project folder path (e.g., /path/to/project or C:\path\to\project)"
                />
                <Folder className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors["folder"] && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors["folder"]}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Note: In a real application, this would open a folder browser
                dialog. For this demo, please type or paste the folder path
                manually.
              </p>
            </div>

            {/* Project Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Project Type
              </label>
              <div className="flex flex-wrap gap-4">
                {projectStructureOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="projectType"
                      value={option.value}
                      checked={projectType === option.value}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tree Structure - Only shown for custom projects */}
            {isCustomProject && hasProjectFolder && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Files naming Structure
                </label>
                <input
                  type="text"
                  id="filesStructre"
                  value={structure}
                  onChange={(e) => {
                    if (isCustomProject && hasProjectFolder && !structure)
                      addError(
                        "structure",
                        "When choosing custom project, you need to set files saving regex."
                      );
                    else addError("structure", "");
                    setStructure(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., /{lang}/local.json"
                />

                {errors["structure"] && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors["structure"]}
                  </div>
                )}
              </div>
            )}

            {isCustomProject && !hasProjectFolder && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  Please enter a project folder path above to enable files
                  naming structure customization.
                </p>
              </div>
            )}

            {/* Info message for non-custom projects */}
            {!isCustomProject && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  Project structure customization is only available for{" "}
                  <strong>Custom</strong> projects. Select{" "}
                  <strong>Custom</strong> from the project type options above to
                  configure your project structure.
                </p>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Select File Structure
              </h2>
              <p className="text-slate-600">
                Choose between Flated or Nested structure
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Flated Option */}
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  objectStructureType === "flated"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="structure"
                  value="flated"
                  checked={objectStructureType === "flated"}
                  onChange={(e) => setObjectStructureType(e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">
                    Flated
                  </span>
                  <p className="text-slate-600 text-sm mt-1">
                    Flat, single-level structure
                  </p>
                </div>
              </label>

              {/* Nested Option */}
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  objectStructureType === "nested"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="structure"
                  value="nested"
                  checked={objectStructureType === "nested"}
                  onChange={(e) => setObjectStructureType(e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4">
                  <span className="text-lg font-semibold text-slate-800">
                    Nested
                  </span>
                  <p className="text-slate-600 text-sm mt-1">
                    Hierarchical, multi-level structure
                  </p>
                </div>
              </label>
            </div>

            {/* Select Languages */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-4">
                  <Languages className="h-12 w-12 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Language Selection
                </h1>
                <p className="text-lg text-gray-600">
                  Choose your preferred languages or add custom ones
                </p>
                {/* Summary */}
                <p>
                  {selectedLanguages.length} language
                  {selectedLanguages.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              {errors["languages"] && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors["languages"]}
                </div>
              )}
            </div>

            {selectedLanguages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {currentBaseLanguage.flag && (
                      <span className="mr-2">{currentBaseLanguage.flag}</span>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Current Base Language
                      </h2>
                      <p className="text-gray-600">
                        {currentBaseLanguage?.name} (
                        {currentBaseLanguage?.code.toUpperCase()})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <span>Change Base Language</span>
                    <ChevronsUpDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {/* Language Dropdown */}
            {isDropdownOpen && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select New Base Language
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choose a language to set as your base language
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {selectedLanguages.map((language) => (
                    <div
                      key={language.code}
                      onClick={() => handleBaseLanguageChange(language)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 ${
                        language.base
                          ? "bg-green-50 hover:bg-green-100"
                          : "hover:bg-gray-50"
                      } border-b border-gray-100 last:border-b-0`}
                    >
                      <div className="flex items-center space-x-4">
                        {language.flag && (
                          <span className="mr-2">{language.flag}</span>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {language.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language.code.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {language.base && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Current Base
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-8 mb-8">
              {/* Selected Languages */}
              {selectedLanguages.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Selected Languages
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {selectedLanguages.map((language) => (
                      <div
                        key={language.code}
                        className="flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {language.flag && (
                          <span className="mr-2">{language.flag}</span>
                        )}
                        {language.isCustom && !language.flag && (
                          <Flag className="h-4 w-4 mr-2 text-indigo-600" />
                        )}
                        <span className="mr-2">
                          {language.name} ({language.code})
                        </span>
                        <button
                          onClick={() => removeLanguage(language.code)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Languages */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Available Languages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predefinedLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageToggle(language)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center ${
                        isLanguageSelected(language.code)
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-25 text-gray-700"
                      }`}
                    >
                      <span className="mr-3">{language.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          ({language.code})
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Language Form */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add Custom Language
                  </h2>
                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    {showCustomForm ? "Cancel" : "Add Language"}
                  </button>
                </div>

                {showCustomForm && (
                  <form
                    onSubmit={handleCustomLanguageSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <label
                        htmlFor="languageName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Language Name *
                      </label>
                      <input
                        type="text"
                        id="languageName"
                        value={customLanguage.name}
                        onChange={(e) =>
                          setCustomLanguage({
                            ...customLanguage,
                            name: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.name
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., Klingon"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="languageCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Language Code *
                      </label>
                      <input
                        type="text"
                        id="languageCode"
                        value={customLanguage.code}
                        onChange={(e) =>
                          setCustomLanguage({
                            ...customLanguage,
                            code: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.code
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., tlh"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Use ISO 639-1/2 codes or create your own (letters,
                        numbers, hyphens, underscores only)
                      </p>
                      {errors.code && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.code}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      >
                        Add Custom Language
                      </button>
                    </div>
                  </form>
                )}

                {!showCustomForm && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Click "Add Language" to create your own language option
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            {!isCreating && (
              <button
                onClick={handleDeleteConfirmation}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Delete
              </button>
            )}
            {isCreating && <div></div>}
            <div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isCreating ? "Create Project" : "Save modifications"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewProjectModal;
