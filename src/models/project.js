import { PipeConvertStringsToObjects } from "../pipes/PipeConvertStringsToObjects";
import ioService from "../services/io.service";
import { cloneDeep } from "lodash";
import statisticsService from "../services/statistics.service";
import projectStructureOptions from "../utils/projectStructures";
import { PipeStringToFilename } from "../pipes/PipeStringToFilename";
import projectService from "../services/project.service";
import PipeFlatObjectToNestedObject from "../pipes/PipeFlatObjectToNestedObject";

export class Project {
  constructor({
    id,
    lastModified,
    createdAt,
    name,
    slug,
    type = "custom",
    objectType = "flated",
    folder,
    description = "",
    structure,
    languages = [],
    translation = {},
    stats,
    initialize = true,
  } = {}) {
    // === Validation ===
    if (!name) throw new Error("Project name is required");
    if (!folder) throw new Error("Project folder path is required");
    if (!Array.isArray(languages) || languages.length === 0) {
      throw new Error("At least one language is required");
    }

    // === IDs & Timestamps ===
    this.id = id ?? this._generateId();
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.lastModified = lastModified ? new Date(lastModified) : new Date();

    // === Metadata ===
    this.name = name;
    this.slug = slug ?? this._createSlug(name);
    this.description = description;
    this.type = type;
    this.objectStructureType = objectType;
    this.folder = folder;

    // === Languages & Translation ===
    this.languages = this._ensureBaseLanguage(languages);
    this.translation = cloneDeep(translation);

    // === Structure ===
    this.structure = structure;
    if (!this.structure && this.type !== "custom") {
      this._setStructureFromType(this.type);
    }

    // === Stats ===
    this.stats = stats
      ? {
          lastEditedKey: stats.lastEditedKey || "",
          lastEditedKeyAt: new Date(stats.lastEditedKeyAt || Date.now()),
        }
      : {
          lastEditedKey: "",
          lastEditedKeyAt: new Date(),
        };

    // === UI State ===
    this.progress = 100;
    this.emptySlots = 0;
    this.emptySlotsAsString = "";
    this.status = "completed";

    // === Initialization ===
    if (initialize) {
      this.createTranslationObject();
    }
  }

  // --- Private Helpers ---
  _generateId() {
    return Math.random().toString(36).substring(2, 11);
  }

  _createSlug(str) {
    return (
      this._generateId() +
      "_" +
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }

  _ensureBaseLanguage(languages) {
    const hasBase = languages.some((lang) => lang.base);
    if (hasBase) return languages;
    return languages.map((lang, i) => ({ ...lang, base: i === 0 }));
  }

  _setStructureFromType(type) {
    const option = projectStructureOptions.find((opt) => opt.value === type);
    if (!option) {
      console.warn(`Unknown project type: ${type}`);
      return;
    }
    this.structure = option.regex;
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  // --- Public API ---
  getFilename() {
    return `${new PipeStringToFilename(this.slug).safe().value}.prj`;
  }

  async calculation() {
    this.progress = await statisticsService.getTranslatedProgress(this);
    this.emptySlots = await statisticsService.getEmptySlotsCount(this);
    const emptySlotsByLang = await statisticsService.getEmptySlots(this);

    const missingLangNames = Object.entries(emptySlotsByLang)
      .filter(([_, count]) => count > 0)
      .map(([code]) => this.languages.find((lang) => lang.code === code)?.name)
      .filter(Boolean);

    this.emptySlotsAsString = missingLangNames.join(", ");
    this.status = this.progress < 100 ? "missing" : "completed";
  }

  getLastModifiedAsString() {
    return this._formatDate(this.lastModified);
  }

  getCreatedAtAsString() {
    return this._formatDate(this.createdAt);
  }

  getLastEditedKeyAttAsString() {
    return this._formatDate(this.stats.lastEditedKeyAt);
  }

  getDefaultTranslation() {
    return this.translation[this.languages.find((lang) => lang.base)?.code];
  }

  // --- Translation Management ---

  createKey(tKey, description, values = {}, tags = []) {
    const now = new Date();
    this.stats.lastEditedKey = tKey;
    this.stats.lastEditedKeyAt = now;

    for (const langCode in this.translation) {
      const langData = this.translation[langCode].data;
      const exists = langData.some((item) => item.key === tKey);
      if (!exists) {
        langData.push({
          id: this._generateId(),
          key: tKey,
          value: String(values[langCode] ?? ""),
          tags: Array.isArray(tags) ? tags : [],
          description: String(description ?? ""),
        });
      }
    }
  }

  updateKey(tKey, description, newKey = tKey, values = {}, tags = []) {
    const now = new Date();
    this.stats.lastEditedKey = newKey;
    this.stats.lastEditedKeyAt = now;

    for (const langCode in this.translation) {
      const langData = this.translation[langCode].data;
      const item = langData.find((x) => x.key === tKey);
      if (item) {
        item.key = newKey;
        item.value = String(values[langCode] ?? item.value);
        item.description = String(description ?? item.description);
        item.tags = Array.isArray(tags) ? tags : [];
      }
    }
  }

  async deleteKeyBySetOfKeys(keySet) {
    if (!(keySet instanceof Set)) return;
    for (const langCode in this.translation) {
      this.translation[langCode].data = this.translation[langCode].data.filter(
        (item) => !keySet.has(item.key)
      );
    }
  }

  // --- File I/O ---

  async save() {
    this.lastModified = new Date();
    await this.createTranslationObject();
    await this.checkAllLanguagesIfTheyExist();
    await projectService.save(this);
    await this.saveFiles();
    await this.calculation();
  }

  createTranslationObject() {
    const baseLang = this.languages.find((lang) => lang.base);
    const baseCode = baseLang.code;

    // Ensure base language exists in translation
    if (!this.translation[baseCode]) {
      this.translation[baseCode] = {
        language: baseLang,
        data: new PipeConvertStringsToObjects(
          JSON.parse('{"hello": "Hello World, it\'s Local Localizator!"}')
        )
          .convert()
          .value.getAllEntries(),
      };
    }

    // Sync all languages with base structure
    this.languages.forEach((lang) => {
      if (!this.translation[lang.code]) {
        this.translation[lang.code] = {
          language: lang,
          data: cloneDeep(this.translation[baseCode].data).map((item) => ({
            ...item,
            value: "",
          })),
        };
      }
    });
  }

  checkAllLanguagesIfTheyExist() {
    const validCodes = new Set(this.languages.map((lang) => lang.code));
    Object.keys(this.translation).forEach((code) => {
      if (!validCodes.has(code)) {
        delete this.translation[code];
      }
    });
  }

  parseTemplate(templatePath) {
    return templatePath
      .split("/")
      .filter(Boolean)
      .map((segment) => {
        const match = segment.match(/\{([^}]+)\}/);
        if (match) {
          return {
            type: "dynamic",
            value: segment,
            token: match[0],
            name: match[1],
          };
        }
        return { type: "static", value: segment };
      });
  }

  resolvePath(tokens, language) {
    return tokens
      .map((token) => {
        if (token.type === "dynamic") {
          if (token.name === "lang")
            return token.value.replace(token.token, language.code);
          if (token.name === "culture")
            return token.value.replace(
              token.token,
              language.culture || language.code
            );
          throw new Error(`Unknown template token: {${token.name}}`);
        }
        return token.value;
      })
      .join("/");
  }

  async saveFiles() {
    if (!this.structure) {
      console.warn("No structure defined. Skipping file save.");
      return;
    }

    const tokens = this.parseTemplate(this.structure);

    await Promise.all(
      this.languages.map(async (lang) => {
        const resolvedPath = this.resolvePath(tokens, lang);
        const fullPath = await window.electronAPI.pathJoin(
          this.folder,
          resolvedPath
        );
        const langData = this.translation[lang.code]?.data || [];

        // Build flat object
        const flatObj = langData.reduce((acc, item) => {
          acc[item.key] = String(item.value);
          return acc;
        }, {});

        // Optionally nest it
        const content =
          this.objectStructureType === "nested"
            ? new PipeFlatObjectToNestedObject(flatObj).unflatten().value
            : flatObj;

        await ioService.saveFileWithFullPath(
          fullPath,
          JSON.stringify(content, null, 2)
        );
      })
    );
  }
}
