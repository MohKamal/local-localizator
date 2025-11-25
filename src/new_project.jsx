import React, { useState, useRef } from "react";
import {
  X,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const TreeNode = ({
  node,
  onAddFile,
  onAddFolder,
  selectedFolder,
  setSelectedFolder,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleFolderClick = () => {
    setSelectedFolder(node.id);
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors ${
          selectedFolder === node.id
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-100"
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleFolderClick}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="mr-1 w-5 h-5 flex items-center justify-center"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        <FolderPlus className="w-4 h-4 mr-2 text-blue-500" />
        <span className="text-sm font-medium">{node.name}</span>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-2 border-l-2 border-gray-200 pl-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("react");
  const [treeStructure, setTreeStructure] = useState([
    {
      id: "root",
      name: "src",
      type: "folder",
      children: [],
    },
  ]);
  const [selectedFolder, setSelectedFolder] = useState("root");
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [createIfNotExists, setCreateIfNotExists] = useState(true);
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const openModal = () => {
    setIsModalOpen(true);
    setProjectName("");
    setProjectType("react");
    setTreeStructure([
      { id: "root", name: "src", type: "folder", children: [] },
    ]);
    setSelectedFolder("root");
    setShowAddFolder(false);
    setShowAddFile(false);
    setNewItemName("");
    setCreateIfNotExists(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addFolderToTree = (parentId, folderName) => {
    const addFolder = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...(node.children || []),
              {
                id: `folder-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: folderName,
                type: "folder",
                children: [],
              },
            ],
          };
        }
        if (node.children) {
          return { ...node, children: addFolder(node.children) };
        }
        return node;
      });
    };

    setTreeStructure(addFolder(treeStructure));
  };

  const addFileToTree = (parentId, fileName) => {
    const addFile = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [
              ...(node.children || []),
              {
                id: `file-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: fileName,
                type: "file",
              },
            ],
          };
        }
        if (node.children) {
          return { ...node, children: addFile(node.children) };
        }
        return node;
      });
    };

    setTreeStructure(addFile(treeStructure));
  };

  const handleAddFolder = () => {
    if (newItemName.trim()) {
      addFolderToTree(selectedFolder, newItemName.trim());
      setNewItemName("");
      setShowAddFolder(false);
    }
  };

  const handleAddFile = () => {
    if (newItemName.trim() && selectedFolder) {
      addFileToTree(selectedFolder, newItemName.trim());
      setNewItemName("");
      setShowAddFile(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") {
      if (action === "folder") {
        handleAddFolder();
      } else if (action === "file") {
        handleAddFile();
      }
    }
  };

  const focusInput = (inputRef) => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  const radioOptions = [
    { value: "angular", label: "Angular" },
    { value: "vuejs", label: "Vue.js" },
    { value: "react", label: "React" },
    { value: "custom", label: "Custom" },
  ];

  // Only show tree structure and add buttons when custom is selected
  const isCustomProject = projectType === "custom";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <button
        onClick={openModal}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
      >
        <FilePlus className="w-5 h-5" />
        New Project
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Project
              </h2>
              <button
                onClick={closeModal}
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
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              {/* Project Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Project Type
                </label>
                <div className="flex flex-wrap gap-4">
                  {radioOptions.map((option) => (
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
              {isCustomProject && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Project Structure
                  </label>
                  <div className="flex gap-4">
                    {/* Tree View */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 min-h-64 max-h-80 overflow-y-auto border border-gray-200">
                      {treeStructure.map((node) => (
                        <TreeNode
                          key={node.id}
                          node={node}
                          onAddFile={setShowAddFile}
                          onAddFolder={setShowAddFolder}
                          selectedFolder={selectedFolder}
                          setSelectedFolder={setSelectedFolder}
                        />
                      ))}
                    </div>

                    {/* Add Items Panel */}
                    <div className="w-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {/* Add Folder Button */}
                      <button
                        onClick={() => {
                          setShowAddFolder(true);
                          setNewItemName("");
                          focusInput(folderInputRef);
                        }}
                        className="w-full mb-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Add Folder
                      </button>

                      {/* Add Folder Input */}
                      {showAddFolder && (
                        <div className="mb-4">
                          <input
                            ref={folderInputRef}
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, "folder")}
                            placeholder="Folder name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                            autoFocus
                          />
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={createIfNotExists}
                              onChange={(e) =>
                                setCreateIfNotExists(e.target.checked)
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-600">
                              Create if not exists
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddFolder}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddFolder(false)}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-1 px-2 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Add File Button */}
                      {selectedFolder && !showAddFile && (
                        <button
                          onClick={() => {
                            setShowAddFile(true);
                            setNewItemName("");
                            focusInput(fileInputRef);
                          }}
                          className="w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          <FilePlus className="w-4 h-4" />
                          Add File
                        </button>
                      )}

                      {/* Add File Input */}
                      {showAddFile && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, "file")}
                            placeholder="File name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddFile}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddFile(false)}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-1 px-2 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info message for non-custom projects */}
              {!isCustomProject && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Project structure customization is only available for{" "}
                    <strong>Custom</strong> projects. Select{" "}
                    <strong>Custom</strong> from the project type options above
                    to configure your project structure.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle project creation logic here
                  const projectData = {
                    name: projectName,
                    type: projectType,
                    structure: isCustomProject ? treeStructure : null,
                  };
                  closeModal();
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
