import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getList as getListApi,
  getSavedFilters,
  setSavedFilters as setSavedFiltersApi,
  setList as setListApi,
} from "./api";
import ListSection from "./components/ListSection";
import FilterSection from "./components/FilterSection";
import ListItemDetailSection from "./components/ListItemDetailsSection";
import { v4 as uuidv4 } from "uuid";

import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyles } from "./components/ui/Themes.ts";
import { IconContext } from "@phosphor-icons/react";

export interface ListItem {
  id: string;
  summary: string;
  description: string;
  tags: string[];
}

export interface Filter {
  id: string;
  fieldToFilter: string;
  operator: string;
  expectedValue: string;
}

export default function App() {
  const [savedFiltersState, setSavedFiltersState] = useState<{
    [filterSetName: string]: { [filterId: string]: Filter };
  }>({});

  const setSavedFilters = (savedFiltersParam: {
    [filterSetName: string]: { [filterId: string]: Filter };
  }) => {
    setSavedFiltersState(savedFiltersParam);
    setSavedFiltersApi(savedFiltersParam);
  };

  const addSavedFilter = (
    filterSetName: string,
    filterSet: { [filterId: string]: Filter }
  ): void => {
    const tempSavedFilters = { ...savedFiltersState };

    let filterSetNameNonDuplicated = filterSetName;
    while (
      Object.keys(savedFiltersState).includes(filterSetNameNonDuplicated)
    ) {
      filterSetNameNonDuplicated += "1";
    }

    tempSavedFilters[filterSetNameNonDuplicated] = filterSet;
    setSavedFilters(tempSavedFilters);
  };

  const removeSavedFilter = (filterSetName: string): void => {
    const tempSavedFilters = { ...savedFiltersState };

    delete tempSavedFilters[filterSetName];

    setSavedFilters(tempSavedFilters);
  };

  useEffect(() => {
    getSavedFilters().then((filters) => {
      if (
        filters["tempFilterSet"] &&
        Object.keys(filters["tempFilterSet"]).length > 0
      ) {
        setSavedFiltersState(filters);
      } else {
        const tempSavedFilters = { ...filters };
        tempSavedFilters["tempFilterSet"] = {
          default: {
            id: "default",
            fieldToFilter: "Tags",
            operator: "Include",
            expectedValue: "Untagged",
          },
        };
        setSavedFiltersState(tempSavedFilters);
      }
    });
  }, []);

  const getTempFilterSet = (): { [filterId: string]: Filter } => {
    return savedFiltersState["tempFilterSet"] ?? {};
  };

  const setTempFilterSet = (filterSet: { [filterId: string]: Filter }) => {
    const tempSavedFilters = { ...savedFiltersState };
    tempSavedFilters["tempFilterSet"] = filterSet;
    setSavedFilters(tempSavedFilters);
  };

  const addFilterToTempFilterSet = (filterToAdd: Filter) => {
    const newFilterId = uuidv4();
    filterToAdd.id = newFilterId;

    const tempFilterSet: { [filterId: string]: Filter } = {
      ...getTempFilterSet(),
    };

    tempFilterSet[newFilterId] = filterToAdd;

    setTempFilterSet(tempFilterSet);
  };

  const editFilter = (filter: Filter) => {
    const tempFilterSet = { ...getTempFilterSet() };
    tempFilterSet[filter.id] = filter;
    setTempFilterSet(tempFilterSet);
  };

  const removeFilterFromFilterSet = (filterIdToRemove: string) => {
    const tempFilterSet: { [filterId: string]: Filter } = {
      ...getTempFilterSet(),
    };
    delete tempFilterSet[filterIdToRemove];
    setTempFilterSet(tempFilterSet);
  };

  const [theme, setTheme] = useState("dark");

  const [list, setList] = useState<{ [itemId: string]: ListItem }>({});
  useEffect(() => {
    getListApi().then((list) => {
      setList(list);
    });
  }, []);

  const [fieldsList, setFieldsList] = useState<{ [tag: string]: boolean }>({});
  useEffect(() => {
    setFieldsList(generateFieldsList(list));
  }, [list]);

  const [isFilteringMatchAny, setIsFilteringMatchAny] = useState(true);
  const [isShowingCompleted, setIsShowingCompleted] = useState(false);

  const [isSortAsc, setIsSortAcs] = useState(false);

  const [focusedListItemId, setFocusedListItemId] = useState<string>("0");

  const [searchBarValue, setSearchBarValue] = useState("");

  const getTagsList = (itemList: { [itemId: string]: ListItem }): string[] => {
    if (Object.keys(itemList).length === 0) return [];

    const allTags = Object.keys(itemList)
      .map((id) => itemList[id].tags)
      .reduce((allTags, tags) => [...allTags, ...tags]);

    return Array.from(new Set(allTags));
  };

  const generateFieldsList = (itemList: {
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
    const tempList: { [itemId: string]: ListItem } = { ...list };
    if (tempList[id].tags.includes(tag)) {
      return;
    } else {
      tempList[id].tags.push(tag);
    }

    setList(tempList);
    setListApi(tempList);
  };

  const removeTagFromListItem = (id: string, tag: string) => {
    const tempList: { [itemId: string]: ListItem } = { ...list };

    if (tempList[id].tags.includes(tag)) {
      tempList[id].tags.splice(tempList[id].tags.indexOf(tag), 1);
    }

    setList(tempList);
    setListApi(tempList);
  };

  const setListItemSummary = (id: string, summary: string) => {
    const tempList: { [itemId: string]: ListItem } = { ...list };

    tempList[id].summary = summary;

    setList(tempList);
    setListApi(tempList);
  };

  const removeListItem = (id: string) => {
    const tempList: { [itemId: string]: ListItem } = { ...list };

    delete tempList[id];

    setList(tempList);
    setListApi(tempList);
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
      searchBarValue: searchBarValue,
      setSearchBarValue: setSearchBarValue,
      fieldsList: fieldsList,
      setSortByList: setFieldsList,
      isSortAsc: isSortAsc,
      setIsSortAcs: setIsSortAcs,
      tagsList: getTagsList(list),
      isShowingCompleted: isShowingCompleted,
      setIsShowingCompleted: setIsShowingCompleted,
      isFilteringMatchAny: isFilteringMatchAny,
      setIsFilteringMatchAny: setIsFilteringMatchAny,
      theme: theme,
      setTheme: setTheme,
      tempFilterSet: getTempFilterSet(),
      setTempFilterSet: setTempFilterSet,
      addFilterToFilterSet: addFilterToTempFilterSet,
      removeFilterFromFilterSet: removeFilterFromFilterSet,
      editFilter: editFilter,
      savedFilters: savedFiltersState,
      addSavedFilter: addSavedFilter,
      removeSavedFilter: removeSavedFilter,
    };
  };

  const getListSectionProps = () => {
    return {
      list: list,
      setList: (itemList: { [itemId: string]: ListItem }) => {
        setList(itemList);
        setListApi(itemList);
      },
      tagsList: getTagsList(list),
      isFilteringMatchAny: isFilteringMatchAny,
      searchBarValue: searchBarValue,
      isShowingCompleted: isShowingCompleted,
      isSortAsc: isSortAsc,
      fieldsList: fieldsList,
      removeTagFromListItem: removeTagFromListItem,
      addTagToListItem: addTagToListItem,
      setListItemSummary: setListItemSummary,
      focusedListItemId: focusedListItemId,
      setFocusedListItemId: setFocusedListItemId,
      removeListItem: removeListItem,
      theme: theme,
      tempFilterSet: getTempFilterSet(),
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
    };
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      <IconContext.Provider value={iconStyles}>
        <Page>
          <FilterSection {...getFilterSectionProps()} />
          <ListSection {...getListSectionProps()} />
          <ListItemDetailSection {...getListItemSectionProps()} />
        </Page>
      </IconContext.Provider>
    </ThemeProvider>
  );
}

const Page = styled.div`
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  display: grid;
  grid-template-columns: 15% 42.5% 42.5%;
  overflow-x: hidden;
`;
