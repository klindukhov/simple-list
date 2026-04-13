import { Filter } from "./App";
import * as localForage from "localforage";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useState } from "react";

const LOCAL_FORAGE_SAVE_DIRECTORY_KEY = "simpleListDirectoryHandle";
const LOCAL_FORAGE_INDEX_FILE_KEY = "simpleListIndexHandle";
const INDEX_FILE_NAME = "sl_Index";
const LOCAL_FORAGE_SAVED_FILTERS_FILE_KEY = "simpleListSavedFiltersHandle";
const SAVED_FILTERS_FILE_NAME = "sl_SavedFilters";

export interface ListApi {
  setListItemSummary: (itemId: string, newSummary: string) => void;
  addListItemTag: (itemId: string, newTag: string) => void;
  deleteListItemTag: (itemId: string, tag: string) => void;
  setProperty: (
    itemId: string,
    propertyKey: string,
    propertyValue: string,
  ) => void;
  setListItemDescription: (itemId: string, newDescription: string) => void;
  addNewListItem: (tags: string[]) => void;
  deleteListItem: (itemId: string) => void;
  focusedListItemId: string;
  setFocusedListItemId: (itemId: string) => void;
  focusedListItemDescription: string;
  parseFromFile: (itemListString: string) => void;
  getExportList: () => Promise<string>;
  isSaveDirectorySelected: boolean;
  setIsSaveDirectorySelected: (isSelected: boolean) => void;
  setNewSaveDirectory: () => Promise<string>;
}

export interface IndexItem {
  id: string;
  summary: string;
  tags: string[];
}

export const getSaveDirectory = async (): Promise<string> => {
  const fileHandle: FileSystemFileHandle =
    (await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY)) ??
    new FileSystemFileHandle();

  return fileHandle.name;
};

const getIndex = async (): Promise<{
  [itemId: string]: IndexItem;
}> => {
  const indexFileHandle: FileSystemFileHandle | null =
    await localForage.getItem(LOCAL_FORAGE_INDEX_FILE_KEY);

  if (!indexFileHandle) {
    throw new Error("Index file is not selected;");
  }

  return JSON.parse(await (await indexFileHandle.getFile()).text()) ?? {};
};

const setIndexFile = async (indexList: { [itemId: string]: IndexItem }) => {
  const indexFileHandle: FileSystemFileHandle | null =
    await localForage.getItem(LOCAL_FORAGE_INDEX_FILE_KEY);

  if (!indexFileHandle) {
    throw new Error("Index file is not selected;");
  }

  const writableStream = await indexFileHandle.createWritable();
  await writableStream.write(JSON.stringify(indexList));
  await writableStream.close();
};

export const getSavedFilters = async (): Promise<{
  [filterSetId: string]: { [filterId: string]: Filter };
}> => {
  let savedFiltersFileHandle: FileSystemFileHandle | null =
    await localForage.getItem(LOCAL_FORAGE_SAVED_FILTERS_FILE_KEY);

  if (!savedFiltersFileHandle) {
    const directoryHandle: FileSystemDirectoryHandle | null =
      await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

    if (!directoryHandle) {
      throw new Error("Directory is not selected;");
    }

    savedFiltersFileHandle = await directoryHandle.getFileHandle(
      SAVED_FILTERS_FILE_NAME,
      { create: true },
    );

    localForage.setItem(
      LOCAL_FORAGE_SAVED_FILTERS_FILE_KEY,
      savedFiltersFileHandle,
    );
  }

  return (
    JSON.parse(await (await savedFiltersFileHandle.getFile()).text()) ?? {}
  );
};

export const setSavedFilters = async (savedFiltersList: {
  [filterSetId: string]: { [filterId: string]: Filter };
}) => {
  const savedFiltersFileHandle: FileSystemFileHandle | null =
    await localForage.getItem(LOCAL_FORAGE_SAVED_FILTERS_FILE_KEY);

  if (!savedFiltersFileHandle) {
    throw new Error("Saved filters file is not found");
  }

  const writableStream = await savedFiltersFileHandle.createWritable();
  await writableStream.write(JSON.stringify(savedFiltersList));
  await writableStream.close();
};

const getWithRefreshedUpdatedProperty = (
  index: { [itemId: string]: IndexItem },
  itemId: string,
): { [itemId: string]: IndexItem } => {
  const tagIndex = index[itemId].tags.findIndex((t) => t.includes("$Updated="));

  if (tagIndex !== -1) {
    index[itemId].tags[tagIndex] = "$Updated=" + Date.now();
  } else {
    index[itemId].tags.push("$Updated=" + Date.now());
  }

  return index;
};

export const useListApi = (): [{ [itemId: string]: IndexItem }, ListApi] => {
  const [isSaveDirectorySelected, setIsSaveDirectorySelected] = useState(false);
  const [itemList, setItemList] = useState<{ [itemId: string]: IndexItem }>({});
  const [focusedListItemId, setFocusedListItemId] = useState("");
  const [focusedItemDescription, setFocusedItemDescription] = useState("");

  useEffect(() => {
    getIndex()
      .then((list) => {
        setItemList(list);
        setIsSaveDirectorySelected(true);
      })
      .catch(() => {
        setIsSaveDirectorySelected(false);
      });
  }, []);

  const setNewSaveDirectory = async (): Promise<string> => {
    try {
      const simpleListDirectoryHandle = await window.showDirectoryPicker();

      const listString: string = await getExportString();

      localForage.setItem(
        LOCAL_FORAGE_SAVE_DIRECTORY_KEY,
        simpleListDirectoryHandle,
      );

      const indexFileHandle: FileSystemFileHandle =
        await simpleListDirectoryHandle.getFileHandle(INDEX_FILE_NAME, {
          create: true,
        });
      localForage.setItem(LOCAL_FORAGE_INDEX_FILE_KEY, indexFileHandle);

      parseFromFile(listString);

      return simpleListDirectoryHandle.name;
    } catch {
      return "";
    }
  };

  const setIndexList = (indexList: { [itemId: string]: IndexItem }) => {
    setItemList(indexList);
    setIndexFile(indexList);
  };

  const setListItemSummary = async (itemId: string, newSummary: string) => {
    let itemListCopy = { ...itemList };
    itemListCopy[itemId].summary = newSummary;
    setIndexList(getWithRefreshedUpdatedProperty(itemListCopy, itemId));
  };

  const addListItemTag = (itemId: string, newTag: string) => {
    let itemListCopy = { ...itemList };
    itemListCopy[itemId].tags.push(newTag);
    setIndexList(getWithRefreshedUpdatedProperty(itemListCopy, itemId));
  };

  const deleteListItemTag = (itemId: string, tag: string) => {
    let itemListCopy = { ...itemList };
    const deleteIndex = itemListCopy[itemId].tags.indexOf(tag);
    itemListCopy[itemId].tags.splice(deleteIndex, 1);
    setIndexList(getWithRefreshedUpdatedProperty(itemListCopy, itemId));
  };

  const setProperty = (
    itemId: string,
    propertyKey: string,
    propertyValue: string,
  ) => {
    let itemListCopy = { ...itemList };

    const tagIndex = itemListCopy[itemId].tags.findIndex((t) =>
      t.includes(`\$${propertyKey}=`),
    );

    if (tagIndex !== -1) {
      itemListCopy[itemId].tags[tagIndex] = `\$${propertyKey}=${propertyValue}`;
    } else {
      itemListCopy[itemId].tags.push(`\$${propertyKey}=${propertyValue}`);
    }

    setIndexList(getWithRefreshedUpdatedProperty(itemListCopy, itemId));
  };

  const setListItemDescription = async (
    itemId: string,
    newDescription: string,
  ) => {
    setFocusedItemDescription(newDescription);
    let itemListCopy = { ...itemList };

    const directoryHandle: FileSystemDirectoryHandle | null =
      await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

    if (!directoryHandle) {
      throw new Error("Directory is not selected;");
    }

    const fileHandle: FileSystemFileHandle =
      await directoryHandle.getFileHandle(itemId, { create: true });

    const writableStream = await fileHandle.createWritable();
    await writableStream.write(newDescription);
    await writableStream.close();

    setIndexList(getWithRefreshedUpdatedProperty(itemListCopy, itemId));
  };

  const addNewListItem = (tags: string[]) => {
    let itemListCopy = { ...itemList };

    const newItemId = uuidv4();
    itemListCopy[newItemId] = {
      id: newItemId,
      summary: "",
      tags: ["$Created=" + Date.now(), "$Updated=" + Date.now(), ...tags],
    };

    setIndexList(itemListCopy);
  };

  const deleteListItem = async (itemId: string) => {
    let itemListCopy = { ...itemList };

    const directoryHandle: FileSystemDirectoryHandle | null =
      await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

    if (!directoryHandle) {
      throw new Error("Directory is not selected;");
    }

    directoryHandle.removeEntry(itemId);
    delete itemListCopy[itemId];
    setIndexList(itemListCopy);
  };

  const setFocusedListItemIdAndDescription = async (itemId: string) => {
    const directoryHandle: FileSystemDirectoryHandle | null =
      await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

    if (!directoryHandle) {
      throw new Error("Directory is not selected;");
    }
    directoryHandle
      .getFileHandle(itemId)
      .then((handle) => handle.getFile())
      .then(async (file) => {
        const text = await file.text();
        setFocusedItemDescription(text);
        setFocusedListItemId(itemId);
      })
      .catch(() => {
        setFocusedListItemId(itemId);
        setFocusedItemDescription("");
      });
  };

  interface DescriptionItem {
    id: string;
    summary: string;
    description: string;
    tags: string[];
  }

  const parseFromFile = async (itemListString: string) => {
    const descriptionItemList: { [itemID: string]: DescriptionItem } =
      JSON.parse(itemListString);

    let itemListCopy = { ...itemList };

    Object.entries(descriptionItemList).forEach(
      async ([itemId, descriptionItem]) => {
        itemListCopy[itemId] = {
          id: itemId,
          summary: descriptionItem.summary,
          tags: descriptionItem.tags,
        };
        if (descriptionItem.description) {
          const directoryHandle: FileSystemDirectoryHandle | null =
            await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

          if (!directoryHandle) {
            throw new Error("Directory is not selected;");
          }

          const fileHandle: FileSystemFileHandle =
            await directoryHandle.getFileHandle(itemId, { create: true });

          const writableStream = await fileHandle.createWritable();
          await writableStream.write(descriptionItem.description);
          await writableStream.close();
        }
      },
    );

    setIndexList(itemListCopy);
  };

  const getExportString = async (): Promise<string> => {
    const getList = async (): Promise<{}> => {
      const directoryHandle: FileSystemDirectoryHandle | null =
        await localForage.getItem(LOCAL_FORAGE_SAVE_DIRECTORY_KEY);

      if (!directoryHandle) {
        throw new Error("Directory is not selected;");
      }

      let list: { [itemId: string]: DescriptionItem } = {};

      for (const id in itemList) {
        try {
          const itemDescriptionFileHandle =
            await directoryHandle.getFileHandle(id);
          const file = await (
            itemDescriptionFileHandle as FileSystemFileHandle
          ).getFile();
          const text = await file.text();
          list[id] = {
            id: id,
            summary: itemList[id].summary,
            description: text,
            tags: itemList[id].tags,
          };
        } catch (e) {
          list[id] = {
            id: id,
            summary: itemList[id].summary,
            description: "",
            tags: itemList[id].tags,
          };
        }
      }
      return list;
    };

    return JSON.stringify(await getList());
  };

  return [
    itemList,
    {
      setListItemSummary: useCallback(setListItemSummary, [setListItemSummary]),
      addListItemTag: useCallback(addListItemTag, [addListItemTag]),
      deleteListItemTag: useCallback(deleteListItemTag, [deleteListItemTag]),
      setProperty: useCallback(setProperty, [setProperty]),
      setListItemDescription: useCallback(setListItemDescription, [
        setListItemDescription,
      ]),
      addNewListItem: useCallback(addNewListItem, [addNewListItem]),
      deleteListItem: useCallback(deleteListItem, [deleteListItem]),
      focusedListItemId: focusedListItemId,
      setFocusedListItemId: useCallback(setFocusedListItemIdAndDescription, [
        setFocusedListItemIdAndDescription,
      ]),
      focusedListItemDescription: focusedItemDescription,
      parseFromFile: useCallback(parseFromFile, [parseFromFile]),
      getExportList: useCallback(getExportString, [getExportString]),
      isSaveDirectorySelected: isSaveDirectorySelected,
      setIsSaveDirectorySelected: setIsSaveDirectorySelected,
      setNewSaveDirectory: setNewSaveDirectory,
    },
  ];
};
