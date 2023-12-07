import { ListItem } from "./App";
import * as localForage from "localforage";

export const getList = async (): Promise<{ [itemId: string]: ListItem }> =>
  (await localForage.getItem("simpleList")) ?? {};

export const setList = (list: { [itemId: string]: ListItem }) =>
  localForage.setItem("simpleList", list);
