import { ListItem } from "./App";

export const getList = async (): Promise<{ [itemId: string]: ListItem }> =>
  await JSON.parse(localStorage.getItem("simpleList") ?? "{}");

export const setList = (list: { [itemId: string]: ListItem }) =>
  localStorage.setItem("simpleList", JSON.stringify(list));
