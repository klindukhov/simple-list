import { styled } from "styled-components";
import { Filter, ListItem } from "../App";
import { CaretRight, CursorClick, List, Plus } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { FILTER_PROPERTY_OPERATORS, FILTER_TAG_OPERATORS } from "../filters";
import PreviewCheckmark from "./ui/PreviewCheckMark";
import { SquareButton } from "./ui/common";

interface ListSectionProps {
  list: { [itemId: string]: ListItem };
  tagsList: string[];
  isFilteringMatchAny: boolean;
  searchBarValue: string;
  isShowingCompleted: boolean;
  isSortAsc: boolean;
  fieldsList: { [tag: string]: boolean };
  removeTagFromListItem: (id: string, tag: string) => void;
  addTagToListItem: (id: string, tag: string) => void;
  setListItemSummary: (id: string, summary: string) => void;
  focusedListItemId: string;
  setFocusedListItemId: (id: string) => void;
  removeListItem: (id: string) => void;
  theme: string;
  tempFilterSet: { [filterId: string]: Filter };
  addListItem: () => void;
  isMobile: boolean;
  handleOpenItemDetailsSection: () => void;
  handleBurgerClick: () => void;
  setSearchBarValue: (value: string) => void;
}

export default function ListSection(props: ListSectionProps) {
  const [isLastItemEmpty, setIsLastItemEmpty] = useState(false);

  const handleListSectionClick = () => {
    if (
      (Object.keys(props.list).length === 0 ||
        props.list[Object.keys(props.list)[Object.keys(props.list).length - 1]]
          .summary !== "") &&
      !isLastItemEmpty
    ) {
      props.addListItem();
      setIsLastItemEmpty(true);
    } else {
      setIsLastItemEmpty(false);
    }
  };

  const areItemsToDisplay = () => {
    return !(
      Object.keys(
        getSearchResult(
          getFilteredList(props.list, props.tempFilterSet),
          props.searchBarValue
        )
      ).length === 0
    );
  };

  const getSearchResult = (
    listParam: { [itemId: string]: ListItem },
    searchBarValueParam: string
  ) => {
    const searchResult: { [itemId: string]: ListItem } = {};
    Object.keys(listParam).forEach((id) => {
      if (
        listParam[id].summary
          .toLowerCase()
          .includes(searchBarValueParam.toLocaleLowerCase()) ||
        listParam[id].description
          .toLowerCase()
          .includes(searchBarValueParam.toLocaleLowerCase())
      ) {
        searchResult[id] = listParam[id];
      }
    });
    return searchResult;
  };

  const getListFilteredByTag = (
    listParam: { [itemId: string]: ListItem },
    filter: Filter
  ) => {
    return Object.fromEntries(
      Object.entries(listParam).filter((entry) => {
        return FILTER_TAG_OPERATORS[
          filter.operator as keyof typeof FILTER_TAG_OPERATORS
        ](entry[1].tags, filter.expectedValue);
      })
    );
  };

  const getListFilterdByFieldValue = (
    listParam: { [itemId: string]: ListItem },
    filter: Filter
  ): { [itemId: string]: ListItem } => {
    const getFieldKey = (tag: string) => {
      return tag[0] === "$" ? tag.split("$")[1].split("=")[0] : "";
    };

    const getFieldValue = (tag: string) => {
      return tag[0] === "$" ? tag.split("=")[1] : "";
    };

    const getIsItemIncluded = (item: ListItem, filter: Filter): boolean => {
      if (!item.tags.find((tag) => filter.fieldToFilter === getFieldKey(tag)))
        return false;
      return FILTER_PROPERTY_OPERATORS[
        filter.operator as keyof typeof FILTER_PROPERTY_OPERATORS
      ](
        getFieldValue(
          item.tags.find((tag) => filter.fieldToFilter === getFieldKey(tag)) ??
            ""
        ),
        filter.expectedValue
      );
    };

    return Object.keys(listParam).reduce(
      (result: { [itemId: string]: ListItem }, itemId: keyof typeof result) => {
        if (getIsItemIncluded(listParam[itemId], filter)) {
          result[itemId as keyof typeof result] = listParam[itemId];
        }
        return result;
      },
      {} as { [itemId: string]: ListItem }
    );
  };

  const getFilteredList = (
    listParam: { [itemId: string]: ListItem },
    filterSet: { [filterId: string]: Filter }
  ) => {
    const filteredListArr: { [itemId: string]: ListItem }[] = [];
    Object.values(filterSet).forEach((filter) => {
      if (filter.fieldToFilter === "Tags") {
        filteredListArr.push(getListFilteredByTag(listParam, filter));
      } else {
        filteredListArr.push(getListFilterdByFieldValue(listParam, filter));
      }
    });

    const getMergedFilteredList = (
      listArr: { [itemId: string]: ListItem }[]
    ) => {
      if (props.isFilteringMatchAny) {
        return listArr.reduce(
          (result, currentList) => ({ ...result, ...currentList }),
          {}
        );
      }
      const intersectLists = (
        o1: { [id: string]: ListItem },
        o2: { [id: string]: ListItem }
      ) => {
        return Object.fromEntries(
          Object.entries(o1).filter((entry) => entry[0] in o2)
        );
      };
      return listArr.reduce((result, currentList) => {
        return intersectLists(result, currentList);
      }, listArr[0]);
    };

    return filteredListArr.length === 0
      ? listParam
      : getMergedFilteredList(filteredListArr);
  };

  const [isAppearingCompletedList, setIsAppearingCompletedList] = useState<{
    [itemId: string]: boolean;
  }>();
  useEffect(() => {
    const tempList: { [itemId: string]: boolean } = {};
    Object.keys(props.list).forEach((id) => {
      tempList[id] = props.list[id].tags.includes(
        props.list[id].tags.find((tag) => tag.includes("Completed")) ??
          "Completed"
      );
    });
    setIsAppearingCompletedList(tempList);
  }, [props.list]);

  const toggleItemCompleted = (id: string) => {
    if (getIsItemCompleted(id)) {
      props.removeTagFromListItem(
        id,
        props.list[id].tags.find((tag) => tag.includes("Completed")) ??
          "Completed"
      );
    } else {
      const sleepNow = (delay: number) =>
        new Promise((resolve) => setTimeout(resolve, delay));
      const tempIsCompletedList: { [itemId: string]: boolean } = {
        ...isAppearingCompletedList,
      };
      tempIsCompletedList[id] = true;
      setIsAppearingCompletedList(tempIsCompletedList);
      if (props.isShowingCompleted) {
        props.addTagToListItem(id, "$Completed=" + Date.now());
      } else {
        sleepNow(2000).then(() =>
          props.addTagToListItem(id, "$Completed=" + Date.now())
        );
      }
    }
  };

  const getIsItemCompleted = (id: string) => {
    return props.list[id].tags.includes(
      props.list[id].tags.find((tag) => tag.includes("Completed")) ??
        "Completed"
    );
  };

  const getIsItemAppearingCompleted = (id: string) => {
    return isAppearingCompletedList && isAppearingCompletedList[id];
  };

  const getListItems = () => {
    return Object.keys(
      getSearchResult(
        getFilteredList(props.list, props.tempFilterSet),
        props.searchBarValue
      )
    )
      .filter(
        (id) =>
          !getIsItemCompleted(id) ||
          (getIsItemCompleted(id) && props.isShowingCompleted)
      )
      .sort((a, b) =>
        (props.list[props.isSortAsc ? b : a].tags
          .find((e) =>
            e.includes(
              `$${Object.keys(props.fieldsList).reduce(
                (a, b) =>
                  props.fieldsList[b as keyof typeof props.fieldsList] ? b : a,
                "Created"
              )}=`
            )
          )
          ?.split("=")[1] ?? 0) >
        (props.list[props.isSortAsc ? a : b].tags
          .find((e) =>
            e.includes(
              `$${Object.keys(props.fieldsList).reduce(
                (a, b) =>
                  props.fieldsList[b as keyof typeof props.fieldsList] ? b : a,
                "Created"
              )}=`
            )
          )
          ?.split("=")[1] ?? 0)
          ? 1
          : 0
      );
  };

  const handleListItemBlur = () => {
    if (
      Object.keys(props.list).length > 0 &&
      props.list[props.focusedListItemId].summary === "" &&
      props.list[props.focusedListItemId].tags.filter((tag) => {
        return (
          !tag.includes("Created") &&
          !tag.includes("Updated") &&
          !tag.includes("Completed")
        );
      }).length === 0 &&
      props.list[props.focusedListItemId].description === ""
    ) {
      props.removeListItem(props.focusedListItemId);
    } else {
      if (props.list[props.focusedListItemId].summary === "") {
        props.setListItemSummary(
          props.focusedListItemId,
          "Untitled (clear all fields to delete)"
        );
      }
    }
  };

  const handleMouseEnter = () => {
    if (
      Object.keys(props.list).length === 0 ||
      props.list[Object.keys(props.list)[Object.keys(props.list).length - 1]]
        .summary !== ""
    ) {
      setIsLastItemEmpty(false);
    } else {
      setIsLastItemEmpty(true);
    }
  };

  return (
    <>
      <ListSectionDiv
        onClick={handleListSectionClick}
        $areItemsToDisplay={areItemsToDisplay()}
        onMouseEnter={handleMouseEnter}
      >
        {!areItemsToDisplay() && (
          <EmptyListPlaceholder>
            <CursorClick size={32} />
            Click here to add an item
          </EmptyListPlaceholder>
        )}
        {areItemsToDisplay() &&
          getListItems().map((id) => (
            <ListItemDiv
              key={id}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <PreviewCheckmark
                onClick={() => toggleItemCompleted(id)}
                height="1.2rem"
                checked={!!getIsItemAppearingCompleted(id)}
              />
              <ListItemElementInput
                value={props.list[id].summary}
                onChange={(e) => {
                  props.setListItemSummary(id, e.target.value);
                  setIsLastItemEmpty(e.target.value === "");
                }}
                onFocus={() => props.setFocusedListItemId(id)}
                onBlur={handleListItemBlur}
                autoFocus={props.list[id].summary === ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if ((e.target as HTMLInputElement).value !== "") {
                      handleListSectionClick();
                      e.currentTarget.blur();
                    }
                  }
                }}
                $isCompleted={getIsItemAppearingCompleted(id) ?? false}
              />
              {props.isMobile && (
                <CaretRightButton
                  onClick={() => {
                    props.handleOpenItemDetailsSection();
                    props.setFocusedListItemId(id);
                  }}
                >
                  <CaretRight height={"1.2rem"} />
                </CaretRightButton>
              )}
            </ListItemDiv>
          ))}
      </ListSectionDiv>
      <NavBar>
        <SquareButton onClick={props.handleBurgerClick}>
          <List />
        </SquareButton>
        <InputField
          onChange={(e) => props.setSearchBarValue(e.target.value)}
          id="searhBarInput"
        />
        <SquareButton onClick={handleListSectionClick}>
          <Plus />
        </SquareButton>
      </NavBar>
    </>
  );
}

const NavBar = styled.div`
  height: 3rem;
  width: 100%;
  display: ${(props) => (props.theme.isListSectionOpen ? "grid" : "none")};
  grid-template-columns: 3rem 1fr 3rem;
  align-items: center;
  justify-items: center;
  padding: 0.5rem;
  box-sizing: border-box;
`;

const InputField = styled.input`
  color: inherit;
  background-color: ${(props) => props.theme.panel};
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 100%;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
`;

const CaretRightButton = styled.div`
  &:active {
    opacity: 0.7;
  }
`;

const EmptyListPlaceholder = styled.div`
  display: grid;
  align-items: center;
  justify-items: center;
  grid-row-gap: 1rem;
`;

const ListSectionDiv = styled.div<{ $areItemsToDisplay: boolean }>`
  height: ${(props) =>
    !props.theme.isFilteringPanelOpen && props.theme.viewMode === "Note"
      ? "calc(100dvh - 3rem)"
      : "100dvh"};
  overflow: scroll;
  display: ${(props) => (props.theme.isListSectionOpen ? "grid" : "none")};
  grid-template-columns: 100%;
  grid-row-gap: 0px;
  justify-items: center;
  align-content: ${(props) => (props.$areItemsToDisplay ? "start" : "center")};
  outline: ${(props) =>
    props.$areItemsToDisplay ? "none" : "thin dashed " + props.theme.text};
  border-radius: 0.5rem;
  justify-content: center;
  outline-offset: -8px;
  width: 100%;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ListItemDiv = styled.div`
  height: 1rem;
  width: 85%;
  background-color: transparent;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: 1.2rem 1fr ${(props) =>
      props.theme.isMobile && "1.2rem"};
  justify-content: start;
  grid-column-gap: 1rem;
  align-items: center;
  border-width: 1px 0px 0px 0px;
  border-color: ${(props) => props.theme.panel};
  border-style: solid;
  &:first-child {
    ${(props) =>
      (props.theme.isFilteringPanelOpen || props.theme.viewMode === "Task") &&
      "margin-top: 1rem;"}
    border: none;
  }
  &:last-child {
    margin-bottom: 2rem;
    border-width: 1px 0px 1px 0px;
  }
  &:hover {
    background-color: ${(props) => props.theme.panel07};
    border-color: transparent;
    border-radius: 0.3rem;
  }
  &:hover + div {
    border-top-color: transparent;
  }
  &:active {
    opacity: 0.7;
  }
`;

const ListItemElementInput = styled.input<{ $isCompleted: boolean }>`
  background-color: transparent;
  justify-self: stretch;
  border-width: 0px 0px 0px 0px;
  color: inherit;
  outline: none;
  width: 100%;
  height: 100%;
  text-decoration: ${(props) =>
    props.$isCompleted ? "line-through" : "inherit"};
`;
