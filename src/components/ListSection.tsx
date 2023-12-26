import { styled } from "styled-components";
import { Filter, ListItem } from "../App";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle, Circle, CursorClick } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { FILTER_OPERATORS } from "./FilterSection";

interface ListSectionProps {
  list: { [itemId: string]: ListItem };
  setList: Function;
  tagsList: string[];
  isFilteringMatchAny: boolean;
  searchBarValue: string;
  isShowingCompleted: boolean;
  isSortAsc: boolean;
  fieldsList: { [tag: string]: boolean };
  removeTagFromListItem: Function;
  addTagToListItem: Function;
  setListItemSummary: Function;
  focusedListItemId: string;
  setFocusedListItemId: Function;
  removeListItem: Function;
  theme: string;
  filterSet: { [filterId: string]: Filter };
  setFilterSet: Function;
}

export default function ListSection(props: ListSectionProps) {
  const [isLastItemEmpty, setIsLastItemEmpty] = useState(false);

  const addListItem = () => {
    let tempList: { [itemId: string]: ListItem } = { ...props.list };

    const newId = uuidv4();
    // let newTags: string[] = Object.keys(props.tagsList).filter(
    //   (tag) => props.tagsList[tag] && tag !== "Created"
    // );
    tempList[newId] = {
      id: newId,
      summary: "",
      description: "",
      tags: ["$Created=" + Date.now()],
    };

    props.setList(tempList);
    setIsLastItemEmpty(true);
  };

  const handleListSectionClick = () => {
    if (
      (Object.keys(props.list).length === 0 ||
        props.list[Object.keys(props.list)[Object.keys(props.list).length - 1]]
          .summary !== "") &&
      !isLastItemEmpty
    ) {
      addListItem();
    } else {
      setIsLastItemEmpty(false);
    }
  };

  const areItemsToDisplay = () => {
    return !(
      Object.keys(
        getSearchResult(
          getFilteredList(props.list, props.filterSet),
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

  const getFilterdByTag = (
    listParam: { [itemId: string]: ListItem },
    tag: string
  ) => {
    let filteredList: { [itemId: string]: ListItem } = {};
    Object.keys(listParam).forEach((itemKey) => {
      if (listParam[itemKey].tags.includes(tag))
        filteredList[itemKey] = listParam[itemKey];
    });
    return filteredList;
  };

  const getFilterdByFieldValue = (
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

      return FILTER_OPERATORS[filter.operator as keyof typeof FILTER_OPERATORS](
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
        filteredListArr.push(getFilterdByTag(listParam, filter.expectedValue));
      } else {
        filteredListArr.push(getFilterdByFieldValue(listParam, filter));
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
      const intersectObjects = (o1: Object, o2: Object) => {
        return Object.fromEntries(
          Object.entries(o1).filter((entry) => entry[0] in o2)
        );
      };
      return listArr.reduce((result, currentList) => {
        return intersectObjects(result, currentList);
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
    let tempList: { [itemId: string]: boolean } = {};
    Object.keys(props.list).forEach((id) => {
      tempList[id] = props.list[id].tags.includes("Completed");
    });
    setIsAppearingCompletedList(tempList);
  }, [props.list]);

  const toggleItemCompleted = (id: string) => {
    if (getIsItemCompleted(id)) {
      props.removeTagFromListItem(id, "Completed");
    } else {
      const sleepNow = (delay: number) =>
        new Promise((resolve) => setTimeout(resolve, delay));
      let tempIsCompletedList: { [itemId: string]: boolean } = {
        ...isAppearingCompletedList,
      };
      tempIsCompletedList[id] = true;
      setIsAppearingCompletedList(tempIsCompletedList);
      sleepNow(2000).then(() => props.addTagToListItem(id, "Completed"));
    }
  };

  const getIsItemCompleted = (id: string) => {
    return props.list[id].tags.includes("Completed");
  };

  const getIsItemAppearingCompleted = (id: string) => {
    return isAppearingCompletedList && isAppearingCompletedList[id];
  };

  const getListItems = () => {
    return Object.keys(
      getSearchResult(
        getFilteredList(props.list, props.filterSet),
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
              `\$${Object.keys(props.fieldsList).reduce(
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
              `\$${Object.keys(props.fieldsList).reduce(
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
      props.list[props.focusedListItemId].summary === ""
    ) {
      props.removeListItem(props.focusedListItemId);
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
            <CheckMark onClick={() => toggleItemCompleted(id)}>
              {getIsItemAppearingCompleted(id) && (
                <CheckCircle size={"1.2rem"} />
              )}
              {!getIsItemAppearingCompleted(id) && (
                <PreviewCheckMark>
                  <PreviewCheckMarkChecked>
                    <CheckCircle size={"1.2rem"} />
                  </PreviewCheckMarkChecked>
                  <Circle size={"1.2rem"} />
                </PreviewCheckMark>
              )}
            </CheckMark>
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
                  handleListSectionClick();
                  e.currentTarget.blur();
                }
              }}
              $isCompleted={getIsItemAppearingCompleted(id) ?? false}
            />
          </ListItemDiv>
        ))}
    </ListSectionDiv>
  );
}

const EmptyListPlaceholder = styled.div`
  display: grid;
  align-items: center;
  justify-items: center;
  grid-row-gap: 1rem;
`;

const ListSectionDiv = styled.div<{ $areItemsToDisplay: boolean }>`
  height: 100vh;
  overflow: scroll;
  display: grid;
  grid-template-columns: 100%;
  grid-row-gap: 0px;
  justify-items: center;
  align-content: ${(props) => (props.$areItemsToDisplay ? "start" : "center")};
  outline: ${(props) =>
    props.$areItemsToDisplay ? "none" : "medium dashed " + props.theme.text};
  justify-content: center;
  outline-offset: -8px;
  width: 100%;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CheckMark = styled.span`
  cursor: pointer;
`;

const PreviewCheckMark = styled(CheckMark)`
  &:hover {
    opacity: 0.7;
  }
`;

const PreviewCheckMarkChecked = styled(PreviewCheckMark)`
  position: relative;
  z-index: -1;
  left: 1.2rem;
  margin-left: -1.2rem;
`;

const ListItemDiv = styled.div`
  height: 1rem;
  width: 85%;
  background-color: transparent;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: 1.2rem 1fr;
  justify-content: start;
  grid-column-gap: 1rem;
  align-items: center;
  border-width: 1px 0px 0px 0px;
  border-color: ${(props) => props.theme.panel};
  border-style: solid;
  &:first-child {
    margin-top: 1rem;
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
  & > span:hover ~ input {
    text-decoration: line-through;
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
