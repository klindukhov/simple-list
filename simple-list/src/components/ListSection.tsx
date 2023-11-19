import { styled } from "styled-components";
import { ListItem } from "../App";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle, Circle } from "@phosphor-icons/react";

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
  };

  const handleListSectionClick = () => {
    if (
      Object.keys(props.list).length === 0 ||
      props.list[Object.keys(props.list)[Object.keys(props.list).length - 1]]
        .summary !== ""
    ) {
      addListItem();
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

  const getListItems = () => {
    return Object.keys(
      getSearchResult(
        getFilteredList(props.tagsList, props.list, props.isFilteringMatchAny),
        props.searchBarValue
      )
    )
      .filter(
        (id) =>
          !props.list[id].tags.includes("Completed") ||
          (props.list[id].tags.includes("Completed") &&
            props.isShowingCompleted)
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

  return (
    <ListSectionDiv
      onClick={handleListSectionClick}
      $areItemsToDisplay={areItemsToDisplay()}
    >
      {!areItemsToDisplay() && <div>Click here to add an item</div>}
      {areItemsToDisplay() &&
        getListItems().map((id) => (
          <ListItemDiv
            key={id}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <CheckMark
              onClick={() => {
                if (props.list[id].tags.includes("Completed")) {
                  props.removeTagFromListItem(id, "Completed");
                } else {
                  props.addTagToListItem(id, "Completed");
                }
              }}
            >
              {props.list[id].tags.includes("Completed") && (
                <CheckCircle size={"1.2rem"} />
              )}
              {!props.list[id].tags.includes("Completed") && (
                <Circle size={"1.2rem"} />
              )}
            </CheckMark>
            <ListItemElementInput
              value={props.list[id].summary}
              onChange={(e) => props.setListItemSummary(id, e.target.value)}
              onFocus={() => props.setFocusedListItemId(id)}
              onBlur={handleListItemBlur}
              autoFocus={props.list[id].summary === ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleListSectionClick();
                  e.currentTarget.blur();
                }
              }}
            />
          </ListItemDiv>
        ))}
    </ListSectionDiv>
  );
}

const ListSectionDiv = styled.div<{ $areItemsToDisplay: boolean }>`
  height: 100vh;
  overflow: scroll;
  display: grid;
  justify-items: center;
  align-content: ${(props) => (props.$areItemsToDisplay ? "start" : "center")};
  outline: ${(props) =>
    props.$areItemsToDisplay ? "none" : "medium dashed " + props.theme.text};
  justify-content: center;
  outline-offset: -8px;
`;
const CheckMark = styled.span`
  cursor: pointer;
`;
const ListItemDiv = styled.div`
  margin: 0.1rem;
  height: 1rem;
  width: 50rem;
  background-color: transparent;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: auto auto;
  justify-items: start;
  align-items: center;
  &:first-child {
    margin-top: 1rem;
    border-radius: 1rem 1rem 0rem 0rem;
  }
  &:last-child {
    margin-bottom: 2rem;
  }
`;

const ListItemElementInput = styled.input`
  background-color: transparent;
  border-width: 0px 0px 1px 0px;
  color: inherit;
  outline: none;
  width: 47rem;
`;
