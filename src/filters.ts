export const FILTER_PROPERTY_OPERATORS = {
  Contains: (actualValue: string, expectedValue: string) => {
    return actualValue.includes(expectedValue);
  },
  "Bigger then": (actualValue: string, expectedValue: string) => {
    return actualValue > expectedValue;
  },
  "Smaller then": (actualValue: string, expectedValue: string) => {
    return actualValue < expectedValue;
  },
  Equals: (actualValue: string, expectedValue: string) => {
    return actualValue === expectedValue;
  },
};

export const FILTER_TAG_OPERATORS = {
  Include: (tagList: string[], tag: string) => {
    if (tag === "Untagged") {
      return (
        tagList.filter((tag) => !tag.includes("$") && !tag.includes("="))
          .length === 0
      );
    }
    return tagList.includes(tag);
  },
  Exclude: (tagList: string[], tag: string) => {
    if (tag === "Untagged") {
      return !(
        tagList.filter((tag) => !tag.includes("$") && !tag.includes("="))
          .length === 0
      );
    }
    return !tagList.includes(tag);
  },
};

export const EMPTY_FILTER_TEMPLATE = {
  id: "new",
  fieldToFilter: "",
  operator: "",
  expectedValue: "",
};
