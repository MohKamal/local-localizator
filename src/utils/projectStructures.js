const projectStructureOptions = [
  { value: "angular", label: "Angular", regex: "/i18n/{lang}.json" },
  { value: "vuejs", label: "Vue.js", regex: "/locales/{lang}.json" },
  { value: "react", label: "React", regex: "/locales/{lang}/common.json" },
  { value: "nextjs", label: "Next.js", regex: "/locales/{lang}/common.json" },
  { value: "custom", label: "Custom", regex: "" },
];

export default projectStructureOptions;
