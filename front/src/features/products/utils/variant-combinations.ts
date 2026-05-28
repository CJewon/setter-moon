export type OptionGroupInput = {
  name: string;
  values: string[];
};

export type VariantCombinationOption = {
  groupName: string;
  value: string;
};

export type VariantCombinationItem = {
  key: string;
  label: string;
  options: VariantCombinationOption[];
};

export function normalizeOptionGroups(groups: OptionGroupInput[]) {
  return groups
    .map((group) => ({
      name: group.name.trim(),
      values: Array.from(new Set(group.values.map((value) => value.trim()).filter(Boolean)))
    }))
    .filter((group) => group.name && group.values.length > 0);
}

export function createVariantCombinations(groups: OptionGroupInput[]) {
  const activeGroups = normalizeOptionGroups(groups);

  if (activeGroups.length === 0) {
    return [["기본"]];
  }

  return activeGroups.reduce<string[][]>((acc, group) => {
    if (acc.length === 0) {
      return group.values.map((value) => [value]);
    }

    return acc.flatMap((items) => group.values.map((value) => [...items, value]));
  }, []);
}

export function createVariantCombinationItems(groups: OptionGroupInput[]): VariantCombinationItem[] {
  const activeGroups = normalizeOptionGroups(groups);

  if (activeGroups.length === 0) {
    return [
      {
        key: "default",
        label: "기본",
        options: []
      }
    ];
  }

  return createVariantCombinations(activeGroups).map((values) => {
    const options = values.map((value, index) => ({
      groupName: activeGroups[index]?.name ?? "",
      value
    }));
    const label = values.join(" / ");

    return {
      key: options.map((option) => `${option.groupName}:${option.value}`).join("|"),
      label,
      options
    };
  });
}
