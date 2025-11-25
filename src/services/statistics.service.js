class StatisticsService {
  constructor() {}

  async get(project) {}

  getKeyCount(project) {
    return project.getDefaultTranslation().data.length;
  }

  getSlotsCount(project) {
    return this.getKeyCount(project) * project.selectedLanguages.length;
  }

  async getTranslatedProgess(project) {
    const empty = await this.getEmptySlotsCount(project);
    const totalSlots = this.getSlotsCount(project);
    const filledSlots = totalSlots - empty;
    project.setProgress(Math.floor((filledSlots / totalSlots) * 100));
    return project.progress;
  }

  async getEmptySlots(project) {
    function isEmpty(value) {
      return value === null || value === undefined || value === "";
    }
    let result = {};
    await new Promise(async (resolve) => {
      let index = 0;
      for (const key in project.translation) {
        result[key] = project.translation[key].data.filter(
          (x) => isEmpty(x.value) == true
        ).length;
        index++;
        if (index >= Object.keys(project.translation).length) resolve();
      }
    });

    return result;
  }

  async getEmptySlotsCount(project) {
    const emptySlots = await this.getEmptySlots(project);
    let result = 0;
    await new Promise((resolve) => {
      let index = 0;
      const length = Object.keys(emptySlots).length;
      if (length == 0) resolve();
      for (const key in emptySlots) {
        result += emptySlots[key];
        index++;
        if (index >= length) resolve();
      }
    });
    return result;
  }
}

const statisticsService = new StatisticsService();

export default statisticsService;
