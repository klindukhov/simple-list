import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import {
  IndexItem,
  getSavedFilters,
  setSavedFilters as setSavedFiltersApi,
  useListApi,
} from "./api";
import ListSection, { ListSectionProps } from "./components/ListSection";
import FilterSection, { FilterSectionProps } from "./components/FilterSection";
import ListItemDetailSection, {
  ListItemdetailSectionProps,
} from "./components/ListItemDetailsSection";
import { v4 as uuidv4 } from "uuid";

import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme, GlobalStyles } from "./components/ui/Themes.ts";
import { IconContext } from "@phosphor-icons/react";

import { useMediaQuery } from "react-responsive";

export interface Filter {
  id: string;
  fieldToFilter: string;
  operator: string;
  expectedValue: string;
}

export default function App() {
  const isMobile: boolean = useMediaQuery({ query: "(max-width: 1224px)" });
  const [isFilteringPanelOpen, setIsFilteringPanelOpen] = useState(!isMobile);
  const [isListSectionOpen, setIsListSectionOpen] = useState(true);
  const [isItemDetailsSectionOpen, setIsItemDetailsSectionOpen] = useState(
    !isMobile
  );

  const [theme, setTheme] = useState("dark");

  const iconStyles = {
    color: theme === "dark" ? "#edeef2" : "black",
    size: "1rem",
  };

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
        tempSavedFilters["tempFilterSet"] = {};
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

  const [list, listApi] = useListApi();

  const [isShowingCompleted, setIsShowingCompleted] = useState(false);

  const generateFieldsList = useCallback(
    (itemList: { [itemId: string]: IndexItem }): { [tag: string]: boolean } => {
      if (Object.keys(itemList).length === 0) return {};

      const allTags = Object.keys(
        Object.fromEntries(
          Object.entries(itemList).filter(
            (e) =>
              isShowingCompleted ||
              !e[1].tags.includes(
                e[1].tags.find((tag) => tag.includes("Completed")) ??
                  "Completed"
              )
          )
        )
      )
        .map((id) => itemList[id].tags)
        .reduce((allTags, tags) => [...allTags, ...tags], []);

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
    },
    [isShowingCompleted]
  );

  const [fieldsList, setFieldsList] = useState<{ [tag: string]: boolean }>({});
  useEffect(() => {
    setFieldsList(generateFieldsList(list));
  }, [list, isShowingCompleted, generateFieldsList]);

  const [isFilteringMatchAny, setIsFilteringMatchAny] = useState(true);

  const [isSortAsc, setIsSortAcs] = useState(false);

  const [searchBarValue, setSearchBarValue] = useState("");

  const getTagsList = (itemList: { [itemId: string]: IndexItem }): string[] => {
    if (Object.keys(itemList).length === 0) return [];

    const allTags = Object.keys(
      Object.fromEntries(
        Object.entries(itemList).filter(
          (e) =>
            isShowingCompleted ||
            !e[1].tags.includes(
              e[1].tags.find((tag) => tag.includes("Completed")) ?? "Completed"
            )
        )
      )
    )
      .map((id) => itemList[id].tags)
      .reduce((allTags, tags) => [...allTags, ...tags]);

    return Array.from(new Set(allTags));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files) return;
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      listApi.parseFromFile("" + e.target?.result);
    };
  };

  const addListItem = () => {
    const newTags: string[] = Object.values(getTempFilterSet())
      .filter(
        (filter: Filter) =>
          (filter.fieldToFilter === "Tags" &&
            filter.expectedValue !== "Untagged" &&
            filter.operator !== "Exclude") ||
          filter.operator === "Equals"
      )
      .map((filter) =>
        filter.operator === "Equals"
          ? `$${filter.fieldToFilter}=${filter.expectedValue}`
          : filter.expectedValue
      );
    listApi.addNewListItem(newTags);
  };

  const getFilterSectionProps = (): FilterSectionProps => {
    return {
      list: list,
      searchBarValue: searchBarValue,
      setSearchBarValue: setSearchBarValue,
      fieldsList: fieldsList,
      setSortByList: setFieldsList,
      isSortAsc: isSortAsc,
      toggleIsSortAsc: () => setIsSortAcs(!isSortAsc),
      tagsList: getTagsList(list),
      isShowingCompleted: isShowingCompleted,
      toggleIsShowingCompleted: () =>
        setIsShowingCompleted(!isShowingCompleted),
      isFilteringMatchAny: isFilteringMatchAny,
      setIsFilteringMatchAny: setIsFilteringMatchAny,
      theme: theme,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
      tempFilterSet: getTempFilterSet(),
      setTempFilterSet: setTempFilterSet,
      addFilterToFilterSet: addFilterToTempFilterSet,
      removeFilterFromFilterSet: removeFilterFromFilterSet,
      editFilter: editFilter,
      savedFilters: savedFiltersState,
      addSavedFilter: addSavedFilter,
      removeSavedFilter: removeSavedFilter,
      handleFileUpload: handleFileUpload,
      handleBurgerClick: handleBurgerClick,
      exportList: listApi.exportFile,
    };
  };

  const getListSectionProps = (): ListSectionProps => {
    return {
      list: list,
      tagsList: getTagsList(list),
      isFilteringMatchAny: isFilteringMatchAny,
      searchBarValue: searchBarValue,
      isShowingCompleted: isShowingCompleted,
      isSortAsc: isSortAsc,
      fieldsList: fieldsList,
      removeTagFromListItem: listApi.deleteListItemTag,
      addTagToListItem: listApi.addListItemTag,
      setListItemSummary: listApi.setListItemSummary,
      focusedListItemId: listApi.focusedListItemId,
      focusedListItemDescription: listApi.focusedListItemDescription,
      setFocusedListItemId: listApi.setFocusedListItemId,
      removeListItem: listApi.deleteListItem,
      theme: theme,
      tempFilterSet: getTempFilterSet(),
      addListItem: addListItem,
      isMobile: isMobile,
      handleOpenItemDetailsSection: handleOpenItemDetailsSection,
      handleBurgerClick: handleBurgerClick,
      setSearchBarValue: setSearchBarValue,
      toggleIsShowingCompleted: () =>
        setIsShowingCompleted(!isShowingCompleted),
      toggleIsFilteringMatchAny: () =>
        setIsFilteringMatchAny(!isFilteringMatchAny),
      toggleIsSortAscending: () => setIsSortAcs(!isSortAsc),
    };
  };

  const getListItemSectionProps = (): ListItemdetailSectionProps => {
    return {
      list: list,
      removeListItem: listApi.deleteListItem,
      focusedListItemId: listApi.focusedListItemId,
      focusedListItemDescription: listApi.focusedListItemDescription,
      removeTagFromListItem: listApi.deleteListItem,
      addTagToListItem: listApi.addListItemTag,
      setListItemSummary: listApi.setListItemSummary,
      setListItemDescription: listApi.setListItemDescription,
      editTag: listApi.setProperty,
      tagsList: getTagsList(list),
      onItemDeleteMobile: onItemDeleteMobile,
      handleBurgerClick: handleBurgerClick,
    };
  };

  const getTheme = (theme: string, isFilteringPanelOpen: boolean) => {
    const themeContext: { [key: string]: string | boolean } =
      theme === "light" ? lightTheme : darkTheme;
    themeContext.isFilteringPanelOpen = isFilteringPanelOpen;
    themeContext.isListSectionOpen = isListSectionOpen;
    themeContext.isItemDetailsSectionOpen = isItemDetailsSectionOpen;
    themeContext.viewMode = "Note";
    themeContext.isMobile = true;
    return themeContext;
  };

  const handleBurgerClick = () => {
    if (!isMobile) {
      setIsFilteringPanelOpen(!isFilteringPanelOpen);
    }
    if (isMobile) {
      if (isItemDetailsSectionOpen) {
        setIsListSectionOpen(true);
        setIsItemDetailsSectionOpen(false);
      } else {
        setIsFilteringPanelOpen(!isFilteringPanelOpen);
        setIsListSectionOpen(!isListSectionOpen);
      }
    }
  };

  const onItemDeleteMobile = () => {
    setIsItemDetailsSectionOpen(false);
    setIsListSectionOpen(true);
  };

  const handleOpenItemDetailsSection = () => {
    setIsFilteringPanelOpen(false);
    setIsListSectionOpen(false);
    setIsItemDetailsSectionOpen(true);
  };

  return (
    <ThemeProvider theme={getTheme(theme, isFilteringPanelOpen)}>
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
  height: 100dvh;
  width: 100%;
  background-color: ${(props) => props.theme.background};
  display: grid;
  grid-template-columns: ${(props) =>
    props.theme.isMobile
      ? "100%"
      : props.theme.isFilteringPanelOpen
      ? props.theme.viewMode === "Task"
        ? "15% 40% 45%"
        : "15% 15% 70%"
      : props.theme.viewMode === "Task"
      ? "40% 60%"
      : "15% 85%"};

  overflow-x: hidden;
`;
