import { Filter } from "./App";
import * as localForage from "localforage";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useState } from "react";

const INDEX_FILE_NAME = "sl_Index.json";

const DIRECTORY_PATH = "Documents/LocalSLDistributed/";

export interface ListApi {
  setListItemSummary: (itemId: string, newSummary: string) => void;
  addListItemTag: (itemId: string, newTag: string) => void;
  deleteListItemTag: (itemId: string, tag: string) => void;
  setProperty: (
    itemId: string,
    propertyKey: string,
    propertyValue: string
  ) => void;
  setListItemDescription: (itemId: string, newDescription: string) => void;
  addNewListItem: (tags: string[]) => void;
  deleteListItem: (itemId: string) => void;
  focusedListItemId: string;
  setFocusedListItemId: (itemId: string) => void;
  focusedListItemDescription: string;
  parseFromFile: (itemListString: string) => void;
  exportFile: () => void;
}

export interface IndexItem {
  id: string;
  summary: string;
  tags: string[];
}

const getIndex = async (): Promise<{
  [itemId: string]: IndexItem;
}> => {
  const contents = await Filesystem.readFile({
    path: DIRECTORY_PATH + INDEX_FILE_NAME,
    directory: Directory.ExternalStorage,
    encoding: Encoding.UTF8,
  });
  return JSON.parse(contents.data.toString() ?? "");
};

const setIndexFile = async (indexList: { [itemId: string]: IndexItem }) => {
  Filesystem.writeFile({
    path: DIRECTORY_PATH + INDEX_FILE_NAME,
    data: JSON.stringify(indexList),
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

const getWithRefreshedUpdatedProperty = (
  index: { [itemId: string]: IndexItem },
  itemId: string
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
  const [itemList, setItemList] = useState<{ [itemId: string]: IndexItem }>({});
  const [focusedListItemId, setFocusedListItemId] = useState("");
  const [focusedItemDescription, setFocusedItemDescription] = useState("");

  useEffect(() => {
    getIndex()
      .then((list) => {
        setItemList(list);
      })
      .catch(() => {});
  }, []);

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
    propertyValue: string
  ) => {
    let itemListCopy = { ...itemList };

    const tagIndex = itemListCopy[itemId].tags.findIndex((t) =>
      t.includes(`\$${propertyKey}=`)
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
    newDescription: string
  ) => {
    setFocusedItemDescription(newDescription);
    let itemListCopy = { ...itemList };

    Filesystem.writeFile({
      path: DIRECTORY_PATH + itemId,
      data: newDescription,
      directory: Directory.ExternalStorage,
      encoding: Encoding.UTF8,
    });

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

    Filesystem.deleteFile({
      path: DIRECTORY_PATH + itemId,
      directory: Directory.ExternalStorage,
    });

    delete itemListCopy[itemId];
    setIndexList(itemListCopy);
  };

  const setFocusedListItemIdAndDescription = async (itemId: string) => {
    Filesystem.readFile({
      path: DIRECTORY_PATH + itemId,
      directory: Directory.ExternalStorage,
      encoding: Encoding.UTF8,
    })
      .then((contents) => {
        setFocusedItemDescription(contents.data.toString() ?? "");
        setFocusedListItemId(itemId);
      })
      .catch(() => {
        setFocusedItemDescription("");
        setFocusedListItemId(itemId);
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
          Filesystem.writeFile({
            path: DIRECTORY_PATH + itemId,
            data: descriptionItem.description,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
          });
        }
      }
    );

    setIndexList(itemListCopy);
  };

  const exportFile = async () => {
    const getList = async () => {
      let list: { [itemId: string]: DescriptionItem } = {};

      for (const id of Object.keys(itemList)) {
        try {
          const contents = await Filesystem.readFile({
            path: DIRECTORY_PATH + id,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
          });

          list[id] = {
            id: id,
            summary: itemList[id].summary,
            description: contents.data.toString() || "",
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

    getList()
      .then((list) => {
        Filesystem.writeFile({
          path: "Download/SimpleListExport" + new Date().getTime() + ".txt",
          data: JSON.stringify(list),
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8,
        });
      })
      .catch((e) => console.error(e));
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
      exportFile: useCallback(exportFile, [exportFile]),
    },
  ];
};
