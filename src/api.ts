import { Filter, ListItem } from "./App";
import * as localForage from "localforage";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export const getList = async (): Promise<{ [itemId: string]: ListItem }> => {
  const contents = await Filesystem.readFile({
    path: "Documents/LocalSimpleList/SimpleList.json",
    directory: Directory.ExternalStorage,
    encoding: Encoding.UTF8,
  });
  return JSON.parse(contents.data.toString() ?? "");
};

export const setList = (list: { [itemId: string]: ListItem }) => {
  Filesystem.writeFile({
    path: "Documents/LocalSimpleList/SimpleList.json",
    data: JSON.stringify(list),
    directory: Directory.ExternalStorage,
    encoding: Encoding.UTF8,
  });
};

export const getSavedFilters = async (): Promise<{
  [filterSetId: string]: { [filterId: string]: Filter };
}> => (await localForage.getItem("savedFilters")) ?? {};

export const setSavedFilters = (list: {
  [filterSetId: string]: { [filterId: string]: Filter };
}) => localForage.setItem("savedFilters", list);
