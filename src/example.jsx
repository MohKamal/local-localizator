import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  FileText,
  Calendar,
  Package,
} from "lucide-react";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Localize with Ease,
            <br />
            <span className="text-yellow-300">Develop with Confidence.</span>
          </h1>
        </div>
        <div className="w-32 h-1 bg-white/30 rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

const FileSelection = ({ onFilesSelected }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const selectedFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      date: new Date(file.lastModified).toISOString().split("T")[0],
      type: file.type,
    }));
    onFilesSelected(selectedFiles);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Select Localization Files
        </h2>
        <p className="text-gray-600 mb-8">
          Drag and drop your localization files here, or click to browse
        </p>
        <button
          onClick={handleClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.xml,.properties,.strings,.resx"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-4">
          Supported formats: JSON, XML, Properties, Strings, RESX
        </p>
      </div>
    </div>
  );
};

const MockData = [
  {
    id: "1",
    key: "welcome.message",
    tags: ["welcome", "homepage"],
    description: "Welcome message displayed on the homepage",
    size: "2.5 KB",
    name: "en-US.json",
    date: "2025-11-15",
  },
  {
    id: "2",
    key: "error.404",
    tags: ["error", "not-found"],
    description: "404 error page message",
    size: "1.8 KB",
    name: "en-US.json",
    date: "2025-11-14",
  },
  {
    id: "3",
    key: "button.submit",
    tags: ["button", "form"],
    description: "Submit button text",
    size: "0.9 KB",
    name: "en-US.json",
    date: "2025-11-16",
  },
  {
    id: "4",
    key: "header.nav.home",
    tags: ["navigation", "header"],
    description: "Home navigation link text",
    size: "1.2 KB",
    name: "en-US.json",
    date: "2025-11-13",
  },
];

const specialList = [
  { name: "User Profile", icon: "user" },
  { name: "Settings", icon: "settings" },
  { name: "Dashboard", icon: "dashboard" },
  { name: "Notifications", icon: "bell" },
  { name: "Help Center", icon: "help" },
];

const EditModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [key, setKey] = useState(initialData?.key || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [tags, setTags] = useState(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [selectedSpecialItems, setSelectedSpecialItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setKey(initialData?.key || "");
      setDescription(initialData?.description || "");
      setTags(initialData?.tags || []);
      setSelectedSpecialItems([]);
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

  const handleSpecialItemToggle = (item) => {
    setSelectedSpecialItems((prev) =>
      prev.includes(item.name)
        ? prev.filter((name) => name !== item.name)
        : [...prev, item.name]
    );
  };

  const handleSubmit = () => {
    onSave({
      ...initialData,
      key,
      description,
      tags,
      specialItems: selectedSpecialItems,
    });
    onClose();
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
              value={key}
              onChange={(e) => setKey(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Items
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specialList.map((item, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSpecialItems.includes(item.name)}
                    onChange={() => handleSpecialItemToggle(item)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{item.name}</span>
                </label>
              ))}
            </div>
          </div>
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

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  message = "Are you sure you want to delete the selected items?",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Confirm Deletion
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TranslationTable = ({ selectedFiles }) => {
  const [data, setData] = useState(MockData);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((item) => item.id)));
    }
  };

  const handleDelete = () => {
    const newRows = data.filter((item) => !selectedRows.has(item.id));
    setData(newRows);
    setSelectedRows(new Set());
    setShowDeleteModal(false);
  };

  const handleSave = () => {
    // Mock save functionality
    alert("Changes saved successfully!");
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedItem) => {
    if (creatingNew) {
      const newItem = {
        ...updatedItem,
        id: Math.random().toString(36).substr(2, 9),
        size: "0.5 KB",
        name: selectedFiles[0]?.name || "en-US.json",
        date: new Date().toISOString().split("T")[0],
      };
      setData([...data, newItem]);
      setCreatingNew(false);
    } else {
      const updatedData = data.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setData(updatedData);
    }
    setShowEditModal(false);
  };

  const isAllSelected = selectedRows.size === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Translation Management
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Key
            </button>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{selectedFiles.map((f) => f.name).join(", ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Last modified: {selectedFiles[0]?.date || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => toggleRowSelection(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {item.key}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRows(new Set([item.id]));
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No translations found</div>
              <button
                onClick={handleCreateNew}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first key
              </button>
            </div>
          )}
        </div>

        {selectedRows.size > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedRows.size} item{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
          setCreatingNew(false);
        }}
        onSave={handleEditSave}
        initialData={editingItem}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        message={`Are you sure you want to delete ${selectedRows.size} item${
          selectedRows.size !== 1 ? "s" : ""
        }?`}
      />
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState("splash");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSplashComplete = () => {
    setCurrentView("file-selection");
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    setCurrentView("translation-table");
  };

  if (currentView === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentView === "file-selection") {
    return <FileSelection onFilesSelected={handleFilesSelected} />;
  }

  return <TranslationTable selectedFiles={selectedFiles} />;
}
