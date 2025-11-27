import { useState, useEffect } from "react";
import { Globe, X } from "lucide-react";
import { useProject } from "../../../providers/project.provider";

const EditModal = ({ isOpen, onClose, onSave, initialData }) => {

  const { selectedProject } = useProject();
  const [id] = useState(initialData?.id || "");
  const [key, setKey] = useState(initialData?.key || "");
  const [newKey, setNewKey] = useState(initialData?.key || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [tags, setTags] = useState(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    if (!key) {
      setTranslations({});
      return;
    }

    const loaded = {};
    selectedProject.languages.forEach((lang) => {
      const langData = selectedProject.translation[lang.code]?.data || [];
      const entry = langData.find((item) => item.key === key);
      loaded[lang.code] = entry?.value || "";
    });
    setTranslations(loaded);
  }, [isOpen, key]);

  useEffect(() => {
    if (isOpen) {
      setKey(initialData?.key || "");
      setDescription(initialData?.description || "");
      setTags(initialData?.tags || []);
      setNewTag("");
    }
  }, [isOpen, initialData]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    selectedProject.updateKey(key, description, newKey, translations, tags);

    onSave({
      ...initialData,
      id,
      newKey,
      description,
      tags,
      translations,
    });
    onClose();
  };

  const handleTranslationChange = (languageCode, value) => {
    setTranslations((prev) => ({
      ...prev,
      [languageCode]: value,
    }));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {initialData ? "Edit Translation" : "Create New Key"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key
            </label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter translation key"
            />
          </div>

          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tag"
              />
              <button
                onClick={handleAddTag}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Translation Inputs */}
          {selectedProject.languages.length > 0 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Enter Translations
              </h2>

              <div className="space-y-4">
                {selectedProject.languages.map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {language.flag && (
                        <span className="mr-2">{language.flag}</span>
                      )}
                      <span className="font-medium text-gray-700 min-w-0 truncate">
                        {language.name}
                      </span>
                      {language.base && <span className="text-xs">base</span>}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={translations[language.code] || ""}
                        onChange={(e) =>
                          handleTranslationChange(language.code, e.target.value)
                        }
                        placeholder={`Enter translation in ${language.name}...`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedProject.languages.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Languages Selected
              </h3>
              <p className="text-gray-600">
                Choose languages to start entering translations
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
