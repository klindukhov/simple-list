import { Filter, ListItem } from "./App";
import * as localForage from "localforage";

export const setNewSaveFile = async (): Promise<boolean> => {
  try {
    localForage.setItem(
      "simpleListFileHandle",
      await window.showSaveFilePicker()
    );
    return true;
  } catch {
    return false;
  }
};

export const getList = async (): Promise<{ [itemId: string]: ListItem }> => {
  if (!(await localForage.getItem("simpleListFileHandle")))
    throw new Error("Save file is not selected.");

  const simpleListFileHandle: FileSystemFileHandle =
    (await localForage.getItem("simpleListFileHandle")) ??
    new FileSystemFileHandle();

  return JSON.parse(await (await simpleListFileHandle.getFile()).text()) ?? {};
};

export const setList = async (list: { [itemId: string]: ListItem }) => {
  if (!(await localForage.getItem("simpleListFileHandle")))
    throw new Error("Save file is not selected.");

  const simpleListFileHandle: FileSystemFileHandle =
    (await localForage.getItem("simpleListFileHandle")) ??
    new FileSystemFileHandle();

  const writableStream = await simpleListFileHandle.createWritable();
  await writableStream.write(JSON.stringify(list));
  await writableStream.close();
};

export const getSavedFilters = async (): Promise<{
  [filterSetId: string]: { [filterId: string]: Filter };
}> => (await localForage.getItem("savedFilters")) ?? {};

export const setSavedFilters = (list: {
  [filterSetId: string]: { [filterId: string]: Filter };
}) => localForage.setItem("savedFilters", list);
