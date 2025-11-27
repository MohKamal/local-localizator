import isFlatObject from "../utils/IsFlatObject";
import PipeFlatObjectToNestedObject from "./PipeFlatObjectToNestedObject";

export class PipeConvertStringsToObjects {
  constructor(obj) {
    if (!obj)
      throw MediaError("PipeConvertStringsToObjects: no obj was provided");
    this.obj = obj;
    this.value = undefined;
  }

  convert() {
    if (this.obj === null || typeof this.obj !== "object") {
      return this.obj;
    }

    this.value = Array.isArray(this.obj) ? [] : {};

    if (Array.isArray(this.obj)) {
      let flatenObjects = [];
      this.obj.forEach((o) => {
        if (!isFlatObject(o))
          flatenObjects.push(new PipeFlatObjectToNestedObject(o).flatten().value);
        else flatenObjects.push(o);
      });

      this.obj = flatenObjects;
    } else {
      if (!isFlatObject(this.obj))
        this.obj = new PipeFlatObjectToNestedObject(this.obj).flatten().value;
    }

    for (const key in this.obj) {
      if (!this.obj.hasOwnProperty(key)) continue;

      const value = this.obj[key];

      if (typeof value === "string") {
        // Convert string to the new object format
        this.value[key] = {
          id: Math.random().toString(36).substr(2, 9),
          key: key,
          value: value,
          tags: [],
          description: value,
        };
      } else if (typeof value === "object") {
        // Recurse into nested objects/arrays
        this.value[key] = new PipeConvertStringsToObjects(
          value
        ).convert().value;
      } else {
        // Keep non-string, non-object values unchanged (e.g., numbers, booleans)
        this.value[key] = value;
      }
    }

    // Add the method only to root-level object (not arrays or nested objects)
    if (!Array.isArray(this.obj) && this.obj.constructor === Object) {
      this.value.getAllEntries = function () {
        const entries = [];
        function collectEntries(current) {
          if (Array.isArray(current)) {
            current.forEach((item) => collectEntries(item));
          } else if (current !== null && typeof current === "object") {
            for (const k in current) {
              // Skip the method itself
              if (k === "getAllEntries") continue;
              const val = current[k];
              if (
                val &&
                typeof val === "object" &&
                "id" in val &&
                "key" in val &&
                "value" in val &&
                "description" in val &&
                "tags" in val
              ) {
                entries.push({
                  id: val.id,
                  key: val.key,
                  value: val.value,
                  description: val.description,
                  tags: val.tags,
                });
              } else {
                collectEntries(val);
              }
            }
          }
        }
        collectEntries(this);
        return entries;
      };
    }

    return this;
  }
}
