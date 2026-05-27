export type OptionGroupInput = {
  name: string;
  values: string[];
};

export function createVariantCombinations(groups: OptionGroupInput[]) {
  const activeGroups = groups
    .map((group) => ({
      ...group,
      values: group.values.filter(Boolean)
    }))
    .filter((group) => group.name && group.values.length > 0);

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
