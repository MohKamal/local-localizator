import { PipeConvertStringsToObjects } from "../pipes/ConvertStringsToObjects";
import FlatObjectToNestedObject from "../pipes/FlatObjectToNestedObject";
import ioService from "../services/io.service";
import { cloneDeep } from "lodash";
import statisticsService from "../services/statistics.service";
import projectStructureOptions from "../utils/projectStructures";
import { PipeStringToFilename } from "../pipes/StringToFilename";
import projectService from "../services/project.service";

export class Project {
  constructor(
    id = undefined,
    lastModified = undefined,
    createdAt = undefined,
    name,
    slug = undefined,
    type = "custom",
    objectType = "flated",
    folder,
    description,
    structure = undefined,
    languages = [],
    translation = {},
    stats,
    initialize = true
  ) {
    this.id = id != undefined ? id : Math.random().toString(36).substr(2, 9);
    this.description = description;
    this.lastModified = lastModified ?? new Date();
    this.createdAt = createdAt ?? new Date();
    this.name = name;
    this.slug = slug ?? this.createSlug(name);
    this.type = type;
    this.files = [];
    this.folder = folder;
    this.progress = 100;
    this.emptySlots = 0;
    this.emptySlotsAsString = "";
    this.status = "completed";
    this.selectedLanguages = languages;
    this.objectStructureType = objectType;
    this.translation = translation;
    this.structure = structure;
    if (!structure && type != "custom") {
      this.setStructreFromType(type);
    }
    this.stats = {
      lastEditedKey: "",
      lastEditedKeyAt: new Date(),
    };
    if (stats) {
      this.stats = stats;
      this.stats.lastEditedKeyAt = new Date(stats.lastEditedKeyAt);
    }
    if (initialize) this.createTranslationObject();
  }

  getFilename() {
    return `${new PipeStringToFilename(this.slug).safe().value}.prj`;
  }

  setStructreFromType(type) {
    if (type === "custom") return;
    this.structure = projectStructureOptions.find(
      (x) => x.value === type
    ).regex;
  }

  async clone() {
    const clone = new Project(
      this.id,
      this.lastModified,
      this.createdAt,
      this.name,
      this.slug,
      this.type,
      this.objectStructureType,
      this.folder,
      this.description,
      this.structure,
      this.selectedLanguages,
      this.translation,
      this.stats,
      true
    );
    await clone.calculation();
    return clone;
  }

  async calculation() {
    await statisticsService.getTranslatedProgess(this);
    this.emptySlots = await statisticsService.getEmptySlotsCount(this);
    const emptySluts = await statisticsService.getEmptySlots(this);
    let emptySlotsAsArray = [];
    for (const key in emptySluts) {
      if (emptySluts[key] > 0) {
        emptySlotsAsArray.push(
          this.selectedLanguages.find((x) => x.code === key)?.name
        );
      }
    }
    this.emptySlotsAsString = emptySlotsAsArray.join(", ");
  }

  setProgress(progress) {
    this.progress = progress;
    if (progress < 100) this.status = "missing";
    else this.status = "completed";
  }

  createSlug(str) {
    return (
      Math.random().toString(36).substr(2, 9).toString() +
      "_" +
      str
        .toLowerCase() // Convert to lowercase
        .normalize("NFD") // Normalize unicode characters (split accented chars)
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks (accents)
        .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric chars except spaces/hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, "")
    ); // Trim hyphens from start/end
  }

  getFomatedDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  getLastModifiedAsString() {
    return this.getFomatedDate(this.lastModified);
  }

  getCreatedAtAsString() {
    return this.getFomatedDate(this.createdAt);
  }

  getLastEditedKeyAttAsString() {
    return this.getFomatedDate(this.stats.lastEditedKeyAt);
  }

  async save() {
    this.lastModified = new Date();
    await this.createTranslationObject();
    await this.checkAllLanguagesIfTheyExist();
    await projectService.save(this);
    await this.saveFiles();
    await this.calculation();
  }

  createKey(tKey, description, values = {}, tags = []) {
    // values have only code: value | {fr: "Hello World, it's Local Localizator!", en: "Hello World, it's Local Localizator!"}
    for (const key in this.translation) {
      const t = this.translation[key].data.find((x) => x.key === tKey);
      if (!t) {
        this.stats.lastEditedKey = tKey;
        this.stats.lastEditedKeyAt = new Date();

        this.translation[key].data.push({
          id: Math.random().toString(36).substr(2, 9),
          key: tKey,
          value: values[key] ?? "",
          tags: tags,
          description: description,
        });
      }
    }
  }

  updateKey(tKey, description, newKey, values = {}, tags = []) {
    // values have only code: value | {fr: "Hello World, it's Local Localizator!", en: "Hello World, it's Local Localizator!"}
    for (const key in this.translation) {
      const t = this.translation[key].data.find((x) => x.key === tKey);
      if (t) {
        this.stats.lastEditedKey = tKey;
        this.stats.lastEditedKeyAt = new Date();
        t.value = values[key] ?? "";
        t.description = description;
        t.tags = tags;
        if (newKey != tKey) {
          t.key = newKey;
          this.stats.lastEditedKey = newKey;
        }
      }
    }
  }

  async deleteKey(tKey) {
    await new Promise((resolve) => {
      let index = 0;
      for (const key in this.translation) {
        this.translation[key].data = this.translation[key].data.filter(
          (x) => x.key !== tKey
        );
        index++;
        if (index >= Object.keys(this.translation).length) resolve();
      }
    });
  }

  async deleteKeyById(id) {
    await new Promise((resolve) => {
      let index = 0;
      for (const key in this.translation) {
        this.translation[key].data = this.translation[key].data.filter(
          (x) => x.id !== id
        );
        index++;
        if (index >= Object.keys(this.translation).length) resolve();
      }
    });
  }

  async deleteKeyBySetOfIds(setId) {
    await new Promise((resolve) => {
      let index = 0;
      for (const key in this.translation) {
        this.translation[key].data = this.translation[key].data.filter(
          (x) => !setId.has(x.id)
        );
        index++;
        if (index >= Object.keys(this.translation).length) resolve();
      }
    });
  }

  async deleteKeyBySet(setOf) {
    await new Promise((resolve) => {
      let index = 0;
      for (const key in this.translation) {
        this.translation[key].data = this.translation[key].data.filter(
          (x) => !setOf.has(x.key)
        );
        index++;
        if (index >= Object.keys(this.translation).length) resolve();
      }
    });
  }

  getDefaultTranslation() {
    const lang = this.selectedLanguages.find((x) => x.base == true);
    return this.translation[lang.code];
  }

  async createTranslationObject() {
    await new Promise((resolve) => {
      let index = 0;
      const baseLanguage =
        this.translation[this.selectedLanguages.find((x) => x.base).code];

      this.selectedLanguages.forEach((lang) => {
        if (!this.translation[lang.code]) {
          this.translation[lang.code] = {
            language: lang,
            data:
              baseLanguage != undefined
                ? cloneDeep(baseLanguage.data).map((item) => {
                    item.value = "";
                    return item;
                  })
                : new PipeConvertStringsToObjects(
                    JSON.parse(
                      '{"hello": "Hello World, it\'s Local Localizator!"}'
                    )
                  )
                    .convert()
                    .value.getAllEntries(),
          };
        }
        index++;
        if (index >= this.selectedLanguages.length) resolve();
      });
    });
  }

  async checkAllLanguagesIfTheyExist() {
    await new Promise((resolve) => {
      let index = 0;
      const keys = [];
      for (const key in this.translation) {
        if (!this.selectedLanguages.find((x) => x.code === key)) {
          keys.push(key);
        }
      }
      if (keys.length === 0) resolve();

      keys.forEach((key) => {
        delete this.translation[key];
        index++;
      });
      if (index >= keys.length) resolve();
    });
  }

  hasVariables(str) {
    return /\{[^}]+\}/.test(str);
  }

  parseTemplate(templatePath) {
    const segments = templatePath.split("/");
    const tokens = segments
      .filter((str) => str != null && str !== "" && str != undefined)
      .map((segment) => {
        const match = segment.match(/\{[^}]+\}/);
        return {
          type: match ? "dynamic" : "static",
          value: segment,
          to_replace: match ? match[0] : "",
          name: match ? match[0].replace("{", "").replace("}", "") : "",
        };
      });
    return tokens;
  }

  resolvePath(tokens, language) {
    return tokens
      .map((token) => {
        if (token.type === "dynamic") {
          if (token.name === "lang")
            return token.value.replace(token.to_replace, language.code);
          if (token.name === "culture")
            return token.value.replace(token.to_replace, language.culture);
          // Handle other tokens (e.g., {page}) if needed
          throw new Error(`Unknown token: ${token.name}`);
        }
        return token.value;
      })
      .join("/");
  }

  async saveFiles() {
    const tokens = this.parseTemplate(this.structure);
    await new Promise((resolve) => {
      let index = 0;
      this.selectedLanguages.forEach(async (lang) => {
        index++;
        if (index >= this.selectedLanguages.length) resolve();
        const last_part_path = this.resolvePath(tokens, lang);
        const path = await window.electronAPI.pathJoin(
          this.folder,
          last_part_path
        );
        const translation = this.translation[lang.code];
        let obj = {};
        await new Promise(async (res) => {
          let i = 0;
          for (const item of translation.data) {
            obj[item.key] = item.value;
            i++;
            if (i >= translation.data.length) res();
          }
        });
        let content = obj;
        if (this.objectStructureType === "nested") {
          content = new FlatObjectToNestedObject(obj).unflatten().value;
        }
        ioService.saveFileWithFullPath(path, JSON.stringify(content));
      });
    });
  }
}
