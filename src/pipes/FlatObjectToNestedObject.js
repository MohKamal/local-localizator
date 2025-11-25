export default class FlatObjectToNestedObject {
  constructor(obj) {
    if (!obj) throw Error("FlatObjectToNestedObject: no object was provided");
    this.obj = obj;
    this.value = undefined;
  }

  unflatten() {
    this.value = {};
    for (const key in this.obj) {
      const keys = key.split(".");
      let curr = this.value;
      for (let i = 0; i < keys.length - 1; i++) {
        curr[keys[i]] = curr[keys[i]] || {};
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = this.obj[key];
    }
    return this;
  }

  flatten(prefix = "") {
    this.value = {};
    for (const key in this.obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof this.obj[key] === "object" &&
        this.obj[key] !== null &&
        !Array.isArray(this.obj[key])
      ) {
        Object.assign(this.value, flatten(this.obj[key], fullKey));
      } else {
        this.value[fullKey] = this.obj[key];
      }
    }
    return this;
  }
}
