import { ListItem } from "./App";

export const getList = async (): Promise<ListItem[]> =>
  await JSON.parse(localStorage.getItem("simpleList") ?? "[]");

export const setList = (list: ListItem[]) =>
  localStorage.setItem("simpleList", JSON.stringify(list));
