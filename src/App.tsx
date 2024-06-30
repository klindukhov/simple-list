import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import {
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
import { Folder, CaretLeft, IconContext, X, List } from "@phosphor-icons/react";
import { setNewSaveDirectory } from "./api";
import { WideButton } from "./components/ui/common.ts";
import { SquareButton } from "./components/ui/common.ts";

import { IndexItem } from "./api.ts";

export interface Filter {
  id: string;
  fieldToFilter: string;
  operator: string;
  expectedValue: string;
}

export default function App() {
  const [isFileSelectionPopUpCancellable, setIsFileSelectionPopUpCancellable] =
    useState(false);
  const [viewMode, setViewMode] = useState("Task");

  const [isFilteringPanelOpen, setIsFilteringPanelOpen] = useState(true);

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

  const [isShowingCompleted, setIsShowingCompleted] = useState(false);

  const [itemList, listApi] = useListApi();

  // Fields used in Filtering and Sorting (the field with "true" value is the one currently sorted by)
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
    setFieldsList(generateFieldsList(itemList));
  }, [itemList, isShowingCompleted, generateFieldsList]);

  const [isFilteringMatchAny, setIsFilteringMatchAny] = useState(true);

  const [isSortAsc, setIsSortAcs] = useState(false);

  // const [focusedListItemId, setFocusedListItemId] = useState<string>("0");

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
      list: itemList,
      listApi: listApi,
      searchBarValue: searchBarValue,
      setSearchBarValue: setSearchBarValue,
      fieldsList: fieldsList,
      setSortByList: setFieldsList,
      isSortAsc: isSortAsc,
      toggleIsSortAsc: () => setIsSortAcs(!isSortAsc),
      tagsList: getTagsList(itemList),
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
      toggleViewMode: () => {
        setViewMode(viewMode === "Task" ? "Note" : "Task");
      },
      handleFileUpload: handleFileUpload,
      selectNewSaveFile: () => {
        listApi.setIsSaveDirectorySelected(false);
        setIsFileSelectionPopUpCancellable(true);
      },
    };
  };

  const getListSectionProps = (): ListSectionProps => {
    return {
      list: itemList,
      listApi: listApi,
      tagsList: getTagsList(itemList),
      isFilteringMatchAny: isFilteringMatchAny,
      searchBarValue: searchBarValue,
      isShowingCompleted: isShowingCompleted,
      isSortAsc: isSortAsc,
      fieldsList: fieldsList,
      focusedListItemId: listApi.focusedListItemId,
      setFocusedListItemId: listApi.setFocusedListItemId,
      theme: theme,
      tempFilterSet: getTempFilterSet(),
      addListItem: addListItem,
    };
  };

  const getListItemSectionProps = (): ListItemdetailSectionProps => {
    return {
      list: itemList,
      listApi: listApi,
      focusedListItemId: listApi.focusedListItemId,
      focusedItemDescription: listApi.focusedListItemDescription,
      viewMode: viewMode,
      tagsList: getTagsList(itemList),
    };
  };

  const getTheme = (
    theme: string,
    isFilteringPanelOpen: boolean,
    viewMode: string
  ) => {
    const themeContext: { [key: string]: string | boolean } =
      theme === "light" ? lightTheme : darkTheme;
    themeContext.isFilteringPanelOpen = isFilteringPanelOpen;
    themeContext.viewMode = viewMode;

    return themeContext;
  };

  return (
    <ThemeProvider theme={getTheme(theme, isFilteringPanelOpen, viewMode)}>
      <GlobalStyles />
      <IconContext.Provider value={iconStyles}>
        {!listApi.isSaveDirectorySelected && (
          <PopUpBackdrop>
            <PopUp>
              Please select new save folder location.
              <PopUpBottomRow $isCancellable={isFileSelectionPopUpCancellable}>
                <WideButtonReverse
                  onClick={async () => {
                    const isNewFileSaved = await setNewSaveDirectory();
                    listApi.setIsSaveDirectorySelected(isNewFileSaved);
                    setIsFileSelectionPopUpCancellable(!isNewFileSaved);
                  }}
                >
                  Select <Folder />
                </WideButtonReverse>
                {isFileSelectionPopUpCancellable && (
                  <WideButtonReverse
                    onClick={() => {
                      listApi.setIsSaveDirectorySelected(true);
                      setIsFileSelectionPopUpCancellable(false);
                    }}
                  >
                    Cancel <X />
                  </WideButtonReverse>
                )}
              </PopUpBottomRow>
            </PopUp>
          </PopUpBackdrop>
        )}
        <Page>
          <SquareButtonBurger
            onClick={() => setIsFilteringPanelOpen(!isFilteringPanelOpen)}
          >
            {isFilteringPanelOpen ? <CaretLeft /> : <List />}
          </SquareButtonBurger>
          <FilterSection {...getFilterSectionProps()} />
          <ListSection {...getListSectionProps()} />
          <ListItemDetailSection {...getListItemSectionProps()} />
        </Page>
      </IconContext.Provider>
    </ThemeProvider>
  );
}

const SquareButtonBurger = styled(SquareButton)`
  position: absolute;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  &:hover {
    ${(props) =>
      !props.theme.isFilteringPanelOpen &&
      `background-color: ${props.theme.panel07};`}
  }
`;

const Page = styled.div`
  height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.background};
  display: grid;
  grid-template-columns: ${(props) =>
    props.theme.isFilteringPanelOpen
      ? props.theme.viewMode === "Task"
        ? "15% 40% 45%"
        : "15% 15% 70%"
      : props.theme.viewMode === "Task"
      ? "40% 60%"
      : "15% 85%"};

  overflow-x: hidden;
`;

const PopUpBackdrop = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
  position: absolute;
  display: grid;
  align-items: center;
  justify-items: center;
`;

const PopUp = styled.div`
  height: 15vh;
  width: 20vw;
  background-color: ${(props) => props.theme.background};
  border-radius: 0.5rem;
  display: grid;
  justify-items: center;
  align-items: center;
  font-size: large;
  grid-template-rows: auto auto;
  border: solid 1px ${(props) => props.theme.text};
`;

const PopUpBottomRow = styled.div<{ $isCancellable: boolean }>`
  display: grid;
  grid-template-columns: auto ${(props) => props.$isCancellable && "auto"};
  grid-column-gap: 4rem;
`;

const WideButtonReverse = styled(WideButton)`
  background-color: ${(props) => props.theme.panel};
  &:hover {
    background-color: ${(props) => props.theme.panel07};
  }
`;
