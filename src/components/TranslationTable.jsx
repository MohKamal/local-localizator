import { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Package,
  Search,
  Tag,
  X,
} from "lucide-react";
import EditModal from "./EditModal";
import ConfirmationModal from "./ConfirmationModal";
import { useProject } from "../providers/project.provider";

const TranslationTable = () => {
  const { selectedProject, setSelectedProject } = useProject();
  const [data, setData] = useState(
    selectedProject.getDefaultTranslation().data
  );
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState(new Set());
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
      setSelectedRows(new Set(data.map((item) => item.key)));
    }
  };

  const handleDelete = async () => {
    const newRows = data.filter((item) => !selectedRows.has(item.id));
    await selectedProject.deleteKeyBySet(
      new Set(data.filter((t) => selectedRows.has(t.id)).map((c) => c.key))
    );
    setData(newRows);
    setSelectedRows(new Set());
    setShowDeleteModal(false);
    await selectedProject.save();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
    setShowEditModal(true);
  };

  const handleEditSave = async (updatedItem) => {
    if (creatingNew) {
      selectedProject.createKey(
        updatedItem.newKey,
        updatedItem.description,
        updatedItem.translations,
        updatedItem.tags
      );
      setCreatingNew(false);
    }
    await selectedProject.save();
    setData(
      JSON.parse(JSON.stringify(selectedProject.getDefaultTranslation().data))
    );
  };

  const isAllSelected = selectedRows.size === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;

  // Compute filtered list
  const filteredItems = useMemo(() => {
    if (!searchTerm && selectedTags.length === 0) return data;
    return data.filter((item) => {
      // Name search (case-insensitive)
      const matchesSearch = item.key
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesSearchValue = item.value
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Tag filter: if no tags selected, skip; otherwise, require at least one match
      const matchesTags =
        selectedTags.size === 0 ||
        [...selectedTags].some((tag) => item.tags.includes(tag));

      return (matchesSearchValue || matchesSearch) && matchesTags;
    });
  }, [data, searchTerm, selectedTags]);

  // Extract all unique tags for filter UI
  const allTags = useMemo(() => {
    return [...new Set(data.flatMap((item) => item.tags))];
  }, [data]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags(new Set());
  };

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
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>
              {selectedProject.selectedLanguages.length} language
              {selectedProject.selectedLanguages.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>
              {selectedProject.selectedLanguages.map((f) => f.name).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              Last modified:{" "}
              {selectedProject.getLastModifiedAsString() || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredItems.length} of {data.length} results
            </span>
          </div>
        </div>

        <div className="items-center gap-6 text-sm text-gray-600">
          {/* Top Bar with Search and Tag Filtering */}
          <div className="bg-white">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search keys and values..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Clear All Button */}
              {(searchTerm || selectedTags.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Filter Options */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by tags:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                      selectedTags.has(tag)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
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
                {filteredItems.map((item) => (
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

export default TranslationTable;
