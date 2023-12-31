import { Filter, ListItem } from "./App";
import * as localForage from "localforage";

export const getList = async (): Promise<{ [itemId: string]: ListItem }> =>
  (await localForage.getItem("simpleList")) ?? {};

export const setList = (list: { [itemId: string]: ListItem }) =>
  localForage.setItem("simpleList", list);

export const getSavedFilters = async (): Promise<{
  [filterSetId: string]: { [filterId: string]: Filter };
}> => (await localForage.getItem("savedFilters")) ?? {};

export const setSavedFilters = (list: {
  [filterSetId: string]: { [filterId: string]: Filter };
}) => localForage.setItem("savedFilters", list);
