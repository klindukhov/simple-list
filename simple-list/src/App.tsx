import { useEffect, useState } from "react";
import styled from "styled-components";
import { getList as getListApi, setList as setListApi } from "./api";
import ListSection from "./components/ListSection";
import FilterSection from "./components/FilterSection";
import ListItemDetailSection from "./components/ListItemDetailsSection";

import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyles } from "./components/ui/Themes.ts";
import { IconContext } from "@phosphor-icons/react";

export interface ListItem {
  id: string;
  summary: string;
  description: string;
  tags: string[];
}

export default function App() {
  const [list, setList] = useState<{ [itemId: string]: ListItem }>({});
  const [tagsList, setTagsList] = useState<{ [tag: string]: boolean }>({});

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    getListApi().then((list) => {
      setList(list);
      setTagsList(generateTagsList(list));
      setSortByList(generateSortByList(list));
    });
  }, []);

  useEffect(() => setTagsList(generateTagsList(list)), [list]);

  const [isFilteringMatchAny, setIsFilteringMatchAny] = useState(true);
  const [isShowingCompleted, setIsShowingCompleted] = useState(false);

  const [isSortAsc, setIsSortAcs] = useState(false);
  const [sortByList, setSortByList] = useState<{ [tag: string]: boolean }>({});

  const [focusedListItemId, setFocusedListItemId] = useState<string>("0");

  const [searchBarValue, setSearchBarValue] = useState("");

  const generateTagsList = (itemList: {
    [itemId: string]: ListItem;
  }): { [tag: string]: boolean } => {
    if (Object.keys(itemList).length === 0) return {};

    const allTags = Object.keys(itemList)
      .map((id) => itemList[id].tags)
      .reduce((allTags, tags) => [...allTags, ...tags]);

    const uniqueTags = Array.from(new Set(allTags));

    const tagsHighlightMap: { [tag: string]: boolean } = {};
    uniqueTags.forEach((tag) => {
      tagsHighlightMap[tag] = false;
    });
    return tagsHighlightMap;
  };

  const generateSortByList = (itemList: {
    [itemId: string]: ListItem;
  }): { [tag: string]: boolean } => {
    if (Object.keys(itemList).length === 0) return {};

    const allTags = Object.keys(itemList)
      .map((id) => itemList[id].tags)
      .reduce((allTags, tags) => [...allTags, ...tags]);

    const uniqueSortingTags = Array.from(
      new Set(
        allTags
          .filter((tag) => tag[0] === "$")
          .map((e) => e.split("$")[1].split("=")[0])
      )
    );

    const sortingList: { [tag: string]: boolean } = {};
    uniqueSortingTags.forEach((tag) => {
      sortingList[tag] = tag === "Created";
    });
    return sortingList;
  };

  const addTagToListItem = (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    if (tempList[id].tags.includes(tag)) {
      return;
    } else {
      tempList[id].tags.push(tag);
    }

    setList(tempList);
    setListApi(tempList);
    setTagsList(generateTagsList(tempList));
  };

  const removeTagFromListItem = (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    if (tempList[id].tags.includes(tag)) {
      tempList[id].tags.splice(tempList[id].tags.indexOf(tag), 1);
    }

    setList(tempList);
    setListApi(tempList);
    setTagsList(generateTagsList(tempList));
  };

  const setListItemSummary = (id: string, summary: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    tempList[id].summary = summary;

    setList(tempList);
    setListApi(tempList);
  };

  const removeListItem = (id: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    delete tempList[id];

    setList(tempList);
    setListApi(tempList);
    setTagsList(generateTagsList(tempList));
  };

  const iconStyles = {
    color: theme === "dark" ? "#edeef2" : "black",
    size: "1rem",
  };

  const getFilterSectionProps = () => {
    return {
      list: list,
      setList: (itemList: { [itemId: string]: ListItem }) => {
        setList(itemList);
        setListApi(itemList);
      },
      setSearchBarValue: setSearchBarValue,
      sortByList: sortByList,
      setSortByList: setSortByList,
      isSortAsc: isSortAsc,
      setIsSortAcs: setIsSortAcs,
      tagsList: tagsList,
      setTagsList: setTagsList,
      isShowingCompleted: isShowingCompleted,
      setIsShowingCompleted: setIsShowingCompleted,
      isFilteringMatchAny: isFilteringMatchAny,
      setIsFilteringMatchAny: setIsFilteringMatchAny,
      theme: theme,
      setTheme: setTheme,
    };
  };

  const getListSectionProps = () => {
    return {
      list: list,
      setList: (itemList: { [itemId: string]: ListItem }) => {
        setList(itemList);
        setListApi(itemList);
      },
      tagsList: tagsList,
      isFilteringMatchAny: isFilteringMatchAny,
      searchBarValue: searchBarValue,
      isShowingCompleted: isShowingCompleted,
      isSortAsc: isSortAsc,
      sortByList: sortByList,
      removeTagFromListItem: removeTagFromListItem,
      addTagToListItem: addTagToListItem,
      setListItemSummary: setListItemSummary,
      focusedListItemId: focusedListItemId,
      setFocusedListItemId: setFocusedListItemId,
      removeListItem: removeListItem,
      theme: theme,
    };
  };

  const getListItemSectionProps = () => {
    return {
      list: list,
      setList: (itemList: { [itemId: string]: ListItem }) => {
        setList(itemList);
        setListApi(itemList);
      },
      theme: theme,
      removeListItem: removeListItem,
      focusedListItemId: focusedListItemId,
      removeTagFromListItem: removeTagFromListItem,
      addTagToListItem: addTagToListItem,
      setListItemSummary: setListItemSummary,
      generateTagsList: generateTagsList,
    };
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      <IconContext.Provider value={iconStyles}>
        <Page>
          <FilterSection {...getFilterSectionProps()} />
          <ListSection {...getListSectionProps()} />
          {(focusedListItemId === "0" ||
            !list[focusedListItemId] ||
            Object.keys(list).length === 0 ||
            list[focusedListItemId].summary === "") && (
            <ListItemDetailsPanelPlaceholder />
          )}
          {focusedListItemId !== "0" &&
            list[focusedListItemId] &&
            list[focusedListItemId].summary !== "" && (
              <ListItemDetailSection {...getListItemSectionProps()} />
            )}
        </Page>
      </IconContext.Provider>
    </ThemeProvider>
  );
}

const Page = styled.div`
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: grid;
  grid-template-columns: 20% 50% 30%;
`;

const ListItemDetailsPanelPlaceholder = styled.div`
  background-color: ${(props) => props.theme.panel};
`;
