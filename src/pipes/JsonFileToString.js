export class PipeJsonFileToString {
  constructor(file) {
    if (!file) throw MediaError("PipeJsonFileToString: no file was provided");
    this.file = file;
    this.value = undefined;
  }

  async toString() {
    this.value = await this.file.text();
    return this;
  }

  async toObject() {
    if (!this.value) await this.toString();
    try {
      this.value = JSON.parse(this.value);
    } catch (e) {
      throw Error("PipeJsonFileToString Error: " + e);
    }
    return this;
  }
}
