class StatisticsService {
  /**
   * Checks if a translation value is empty.
   * @param {*} value - The value to check.
   * @returns {boolean}
   */
  _isEmpty(value) {
    return value === null || value === undefined || value === "";
  }

  /**
   * Gets the total number of translation keys (from base language).
   * @param {Project} project
   * @returns {number}
   */
  getKeyCount(project) {
    const baseTranslation = project.getDefaultTranslation();
    return baseTranslation ? baseTranslation.data.length : 0;
  }

  /**
   * Gets the total number of translation slots (keys × languages).
   * @param {Project} project
   * @returns {number}
   */
  getSlotsCount(project) {
    return this.getKeyCount(project) * project.languages.length;
  }

  /**
   * Calculates and returns the translation progress percentage.
   * Also updates `project.progress` and `project.status`.
   * @param {Project} project
   * @returns {number} Progress percentage (0–100)
   */
  async getTranslatedProgress(project) {
    const emptyCount = await this.getEmptySlotsCount(project);
    const totalSlots = this.getSlotsCount(project);
    const progress =
      totalSlots > 0
        ? Math.floor(((totalSlots - emptyCount) / totalSlots) * 100)
        : 100;

    return progress;
  }

  /**
   * Returns an object mapping language codes to number of empty slots.
   * @param {Project} project
   * @returns {Object.<string, number>}
   */
  getEmptySlots(project) {
    const result = {};
    for (const langCode in project.translation) {
      const langData = project.translation[langCode]?.data || [];
      result[langCode] = langData.filter((item) =>
        this._isEmpty(item.value)
      ).length;
    }
    return result;
  }

  /**
   * Returns the total number of empty translation slots across all languages.
   * @param {Project} project
   * @returns {number}
   */
  getEmptySlotsCount(project) {
    const emptySlots = this.getEmptySlots(project);
    return Object.values(emptySlots).reduce((sum, count) => sum + count, 0);
  }
}

// Singleton export
const statisticsService = new StatisticsService();
export default statisticsService;
