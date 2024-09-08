export interface SearchDropdownProps {
  itemsGroup: {
    [key: string]: {
      label: string;
      value: string;
    }[];
  };
  isTitle: boolean;
  isDivider: boolean;
}
