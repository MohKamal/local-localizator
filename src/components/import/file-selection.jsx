import { useState } from 'react';
import { File, Check, ChevronDown, Upload, Star } from 'lucide-react';
import predefinedLanguages from '../../utils/languages';
import ioService from '../../services/io.service';
import projectService from '../../services/project.service';
import { useView } from '../../providers/view.provider';
import { useProject } from '../../providers/project.provider';

const FileSelection = ({ projects, setProjects }) => {
  const [isFilesVisible, setIsFilesVisible] = useState(false);
  const { setCurrentView } = useView();
  const { setSelectedProject } = useProject();
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [showDropdowns, setShowDropdowns] = useState({});
  const [files, setFiles] = useState([]);
  const [baseFileId, setBaseFileId] = useState(0); // Default base file

  const getFileNameFromPath = (filePath) => {
    return filePath.split('/').pop().split('\\').pop();
  };

  const getFileExtension = (filePath) => {
    const fileName = filePath.split('/').pop().split('\\').pop();
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === 0 || dotIndex === fileName.length - 1) {
      return ''; // No valid extension
    }
    return fileName.slice(dotIndex + 1);
  };

  const hasLanguageCode = (filename) => {
    const langCodes = new Set(predefinedLanguages.map((lang) => lang.code));
    // Remove file extension
    const basename = filename.replace(/\.[^/.]+$/, '');
    // Split by common delimiters: underscore, hyphen, dot
    const parts = basename.split(/[-_.]/);
    // Find the first part that matches a known language code
    return parts.find((part) => langCodes.has(part));
  };

  const loadProject = async (file_path) => {
    const project = await projectService.load(file_path);
    if (project) {
      project.name = `[IMPORTED] ${project.name}`;
      project.save();
      setProjects([...projects, project]);
      return project;
    }
    return undefined;
  };

  const handleUploadFiles = async () => {
    const files_obj = await ioService.openFileDialog();
    if (files_obj.length > 0) return;
    const _files = [];
    let isBase = false;
    files_obj.filePaths
      .filter((path) => ['json'].includes(getFileExtension(path)))
      .forEach(async (path, index) => {
        const code = hasLanguageCode(getFileNameFromPath(path));
        let base = false;
        if (!isBase) {
          base = true;
          isBase = true;
          setBaseFileId(index);
        }
        _files.push({
          id: index,
          path: path,
          name: getFileNameFromPath(path),
          code: code,
          base: base,
        });
        if (code) {
          handleLanguageSelect(index, code);
        }
      });

    files_obj.filePaths
      .filter((path) => ['prj'].includes(getFileExtension(path)))
      .forEach(async (path) => {
        const p = await loadProject(path);
        if (p) {
          if (files_obj.filePaths.length === 1) {
            setSelectedProject(p);
            setCurrentView('project-details');
          }
        }
      });
    setFiles(_files);
    setIsFilesVisible(true);
  };

  const handleLanguageSelect = (fileId, languageCode) => {
    const previousLanguage = selectedLanguages[fileId];
    const file = files.find((x) => x.id === fileId);
    if (file) {
      file.code = languageCode;
    }
    setSelectedLanguages((prev) => ({
      ...prev,
      [fileId]: languageCode,
    }));

    setShowDropdowns((prev) => ({
      ...prev,
      [fileId]: false,
    }));

    if (previousLanguage && previousLanguage !== languageCode) {
      const isPreviousLanguageStillUsed = Object.entries(
        selectedLanguages
      ).some(
        ([otherFileId, lang]) =>
          otherFileId !== String(fileId) && lang === previousLanguage
      );
    }
  };
  const toggleDropdown = (fileId) => {
    setShowDropdowns((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const getAvailableLanguages = (fileId) => {
    const selectedByOthers = new Set();
    Object.entries(selectedLanguages).forEach(([otherFileId, language]) => {
      if (otherFileId !== String(fileId) && language) {
        selectedByOthers.add(language);
      }
    });

    return predefinedLanguages.filter(
      (lang) => !selectedByOthers.has(lang.code)
    );
  };

  const allFilesHaveLanguages = files.every(
    (file) => selectedLanguages[file.id]
  );

  const handleSubmit = async () => {
    const project =
      await projectService.createProjectFromTranslationFiles(files);
    if (project) {
      await project.save();
      setProjects([...projects, project]);
      setSelectedProject(project);
      setCurrentView('project-details');
    }
  };

  const toggleBaseFile = (fileId) => {
    setBaseFileId(fileId);
  };
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Import Files
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select languages files or project's files
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isFilesVisible ? (
            // Selection Button State
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Ready to Assign Languages?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Click below to select the files.
              </p>
              <button
                onClick={handleUploadFiles}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                <File className="w-5 h-5" />
                Import
              </button>
            </div>
          ) : (
            // Files with Language Selection State
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Document Configuration
                </h2>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {Object.keys(selectedLanguages).length} of {files.length}{' '}
                  files selected
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {files.map((file) => {
                  const availableLanguages = getAvailableLanguages(file.id);
                  const currentSelection = selectedLanguages[file.id];
                  const currentLanguage = predefinedLanguages.find(
                    (lang) => lang.code === currentSelection
                  );
                  const isBaseFile = baseFileId === file.id;

                  return (
                    <div
                      key={file.id}
                      className={`border rounded-xl p-4 transition-all duration-200 ${
                        isBaseFile
                          ? 'border-amber-400 bg-amber-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isBaseFile ? 'bg-amber-100' : 'bg-indigo-100'
                            }`}
                          >
                            <File
                              className={`w-5 h-5 ${
                                isBaseFile
                                  ? 'text-amber-600'
                                  : 'text-indigo-600'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800 truncate max-w-xs">
                                {file.name}
                              </h3>
                              {isBaseFile && (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  Base
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Language Selection Dropdown */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleBaseFile(file.id)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              isBaseFile
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                            title={
                              isBaseFile
                                ? 'Base file (click to change)'
                                : 'Set as base file'
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isBaseFile ? 'fill-current' : ''
                              }`}
                            />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(file.id)}
                              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:border-indigo-400 transition-colors duration-200 min-w-[140px] justify-between"
                            >
                              {currentSelection ? (
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {currentLanguage?.flag}
                                  </span>
                                  <span className="text-gray-700">
                                    {currentLanguage?.name}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-400">
                                  Select language
                                </span>
                              )}
                              <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                  showDropdowns[file.id] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {showDropdowns[file.id] && (
                              <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                {availableLanguages.map((language) => (
                                  <button
                                    key={language.code}
                                    onClick={() =>
                                      handleLanguageSelect(
                                        file.id,
                                        language.code
                                      )
                                    }
                                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 flex items-center gap-3"
                                  >
                                    <span className="text-lg">
                                      {language.flag}
                                    </span>
                                    <span>{language.name}</span>
                                    {selectedLanguages[file.id] ===
                                      language.code && (
                                      <Check className="w-4 h-4 text-indigo-600 ml-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsFilesVisible(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allFilesHaveLanguages}
                  className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    allFilesHaveLanguages
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Confirm Configuration
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Each language can only be assigned to one document. The "Other"
            option can be used for multiple files if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileSelection;
