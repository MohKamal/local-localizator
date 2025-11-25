export class PipeReplacePlaceHolders {
  constructor(template, values) {
    if (!template)
      throw MediaError("PipeReplacePlaceHolders: no template was provided");
    if (!values)
      throw MediaError("PipeReplacePlaceHolders: no values were provided");
    this.template = template;
    this.values = values;
    this.value = undefined;
  }

  replacePlaceholders() {
    this.value = this.template.replace(/\{(\w+)\}/g, (match, key) => {
      return this.values[key] !== undefined ? this.values[key] : match; // Keep original if not found
    });
    return this;
  }
}
