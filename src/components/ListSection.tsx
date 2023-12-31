import { styled } from "styled-components";
import { ListItem } from "../App";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle, Circle, CursorClick } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface ListSectionProps {
  list: { [itemId: string]: ListItem };
  setList: Function;
  tagsList: { [tag: string]: boolean };
  isFilteringMatchAny: boolean;
  searchBarValue: string;
  isShowingCompleted: boolean;
  isSortAsc: boolean;
  sortByList: { [tag: string]: boolean };
  removeTagFromListItem: Function;
  addTagToListItem: Function;
  setListItemSummary: Function;
  focusedListItemId: string;
  setFocusedListItemId: Function;
  removeListItem: Function;
  theme: string;
}

export default function ListSection(props: ListSectionProps) {
  const [isLastItemEmpty, setIsLastItemEmpty] = useState(false);

  const addListItem = () => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, props.list);

    const newId = uuidv4();
    let newTags: string[] = Object.keys(props.tagsList).filter(
      (tag) => props.tagsList[tag] && tag !== "Created"
    );
    tempList[newId] = {
      id: newId,
      summary: "",
      description: "",
      tags: ["$Created=" + Date.now(), ...newTags],
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
          getFilteredList(
            props.tagsList,
            props.list,
            props.isFilteringMatchAny
          ),
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

  const getFilteredList = (
    tempTagsList: {
      [tag: string]: boolean;
    },
    listParam: { [itemId: string]: ListItem },
    isFilteringMatchAnyParam: boolean
  ): { [itemId: string]: ListItem } => {
    if (!Object.values(tempTagsList).some((tagHighlight) => tagHighlight)) {
      return listParam;
    }

    let filteredList: { [itemId: string]: ListItem } = {};
    const highlightedTags = Object.keys(tempTagsList).filter(
      (tag) => tempTagsList[tag]
    );

    if (isFilteringMatchAnyParam) {
      highlightedTags.forEach((tag) => {
        Object.keys(listParam).forEach((listItemId) => {
          if (
            listParam[listItemId].tags.includes(tag) &&
            !Object.keys(filteredList).includes(listItemId)
          ) {
            filteredList[listItemId] = listParam[listItemId];
          }
        });
      });
    } else {
      Object.assign(filteredList, listParam);
      highlightedTags.forEach((tag) => {
        Object.keys(listParam).forEach((listItemId) => {
          if (!listParam[listItemId].tags.includes(tag)) {
            if (tag[0] === "$") {
              const fieldTagKey = tag.split("$")[1].split("=")[0];
              if (
                !listParam[listItemId].tags.some(
                  (t) =>
                    t[0] === "$" &&
                    t.split("$")[1].split("=")[0] === fieldTagKey
                )
              )
                delete filteredList[listItemId];
            } else {
              delete filteredList[listItemId];
            }
          }
        });
      });
    }

    return filteredList;
  };

  const [isCompletedList, setIsCompletedList] = useState<{
    [itemId: string]: boolean;
  }>();
  useEffect(() => {
    let tempList: { [itemId: string]: boolean } = {};
    Object.keys(props.list).forEach((id) => {
      tempList[id] = props.list[id].tags.includes("Completed");
    });
    setIsCompletedList(tempList);
  }, [props.list]);

  const toggleItemCompleted = (id: string) => {
    if (getIsItemCompleted(id)) {
      props.removeTagFromListItem(id, "Completed");
    } else {
      const sleepNow = (delay: number) =>
        new Promise((resolve) => setTimeout(resolve, delay));
      let tempIsCompletedList: { [itemId: string]: boolean } = {};
      Object.assign(tempIsCompletedList, isCompletedList);
      tempIsCompletedList[id] = true;
      setIsCompletedList(tempIsCompletedList);
      sleepNow(2000).then(() => props.addTagToListItem(id, "Completed"));
    }
  };

  const getIsItemCompleted = (id: string) => {
    return props.list[id].tags.includes("Completed");
  };

  const getIsItemAppearingCompleted = (id: string) => {
    return isCompletedList && isCompletedList[id];
  };

  const getListItems = () => {
    return Object.keys(
      getSearchResult(
        getFilteredList(props.tagsList, props.list, props.isFilteringMatchAny),
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
              `\$${Object.keys(props.sortByList).reduce(
                (a, b) =>
                  props.sortByList[b as keyof typeof props.sortByList] ? b : a,
                "Created"
              )}=`
            )
          )
          ?.split("=")[1] ?? 0) >
        (props.list[props.isSortAsc ? a : b].tags
          .find((e) =>
            e.includes(
              `\$${Object.keys(props.sortByList).reduce(
                (a, b) =>
                  props.sortByList[b as keyof typeof props.sortByList] ? b : a,
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
    background-color: ${(props) => props.theme.panel};
    opacity: 0.7;
    border-color: transparent;
    border-radius: 0.3rem;
  }
  & > span:hover ~ input {
    text-decoration: line-through;
  }
  &:hover + div {
    border-top-color: transparent;
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
