export class PipeStringToFilename {
  constructor(str) {
    if (!str) throw MediaError("PipeStringToFilename: no string was provided");
    this.str = str;
    this.value = undefined;
  }

  safe(maxLength = 100) {
    // Replace invalid filename characters with underscores (or remove)
    this.value = this.str
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") // Remove control chars + reserved chars
      .replace(/[_\s]+/g, "_") // Collapse multiple underscores/spaces
      .trim();

    // Avoid reserved Windows filenames (case-insensitive)
    const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reserved.test(this.value)) {
      this.value = "_" + this.value;
    }

    // Truncate if necessary
    if (this.value.length > maxLength) {
      this.value = this.value.substring(0, maxLength);
    }

    // Ensure it's not empty
    if (this.value === "") {
      this.value = "unnamed_file";
    }

    return this;
  }
}
