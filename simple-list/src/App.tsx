import { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getList as getListApi, setList as setListApi } from "./api";
import TrashCanCursor from "./assets/TrashCanCursor24fat.png";
import InclusiveDiagram from "./assets/InclusiveDiagramFat.png";
import ExclusiveDiagram from "./assets/ExclusiveDiagramFat.png";
import CompletedCheckMark from "./assets/CompletedCheckMark.png";
import UncompletedCheckMark from "./assets/UncompletedCheckMark.png";
import TrashCanIcon from "./assets/TrashCanIcon.png";

export interface ListItem {
  id: string;
  summary: string;
  description: string;
  tags: string[];
}

export default function App() {
  useEffect(() => {
    getListApi().then((list) => {
      setList(list);
      setTagsList(generateTagsList(list));
    });
  }, []);

  const [list, setList] = useState<{ [itemId: string]: ListItem }>({});
  const [tagsList, setTagsList] = useState<{ [tag: string]: boolean }>({});
  const [isFilteringInclusive, setIsFilteringInclusive] = useState(true);
  const [isShowCompleted, setIsShowCompleted] = useState(false);
  const [focusedListItemId, setFocusedListItemId] = useState<string>("0");
  const [newTag, setNewTag] = useState("");
  const [isSummaryFocused, setIsSummaryFocused] = useState(false);

  useEffect(() => {
    if (Object.keys(list).length > 0 && list[focusedListItemId] === undefined) {
      setFocusedListItemId(Object.keys(list)[0]);
    }
  }, [list]);

  const generateTagsList = (itemList: {
    [itemId: string]: ListItem;
  }): { [tag: string]: boolean } => {
    if (Object.keys(itemList).length === 0) return {};

    const allTags = Object.keys(itemList)
      .map((id) => itemList[id].tags)
      .reduce((allTags, tags) => [...allTags, ...tags]);

    const uniqueTags = Array.from(new Set(allTags));

    let tagsHighlightList: { [tag: string]: boolean } = {};
    uniqueTags.forEach((tag) => {
      tagsHighlightList[tag] = false;
    });
    return tagsHighlightList;
  };

  const addNewTagToList = (tag: string) => {
    if (Object.keys(tagsList).includes(tag)) return;
    let tempTagsList: { [tag: string]: boolean } = {};
    Object.assign(tempTagsList, tagsList);

    tempTagsList[tag] = false;

    setTagsList(tempTagsList);
  };

  const removeTagFromList = (tag: string) => {
    let tempTagsList: { [tag: string]: boolean } = {};
    Object.assign(tempTagsList, tagsList);

    delete tempTagsList[tag];

    setTagsList(tempTagsList);
  };

  const setListItemSummary = (id: string, summary: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    tempList[id].summary = summary;

    setList(tempList);
    setListApi(tempList);
  };

  const setListItemDescription = (id: string, description: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    tempList[id].description = description;

    setList(tempList);
    setListApi(tempList);
  };

  const createNewListItem = () => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    const lastElementId =
      Object.keys(tempList)[Object.keys(tempList).length - 1];
    if (
      Object.keys(tempList).length > 0 &&
      tempList[lastElementId].summary === ""
    ) {
      delete tempList[lastElementId];
    } else {
      const newId = uuidv4();
      let newTags: string[] = [];
      Object.keys(tagsList).forEach((tag) => {
        if (tagsList[tag] && tag !== "Created") {
          newTags.push(tag);
        }
      });
      tempList[newId] = {
        id: newId,
        summary: "",
        description: "",
        tags: ["Created", ...newTags],
      };
    }

    setList(tempList);
    setListApi(tempList);
  };

  const removeElement = (id: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    delete tempList[id];

    setList(tempList);
    setListApi(tempList);
  };

  const handleItemFocus = (listItem: ListItem) => {
    window.addEventListener("keypress", (e) => {
      if (e.key === "Enter") createNewListItem();
    });
    setFocusedListItemId(listItem.id);
  };

  const addTag = (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    if (tempList[id].tags.includes(tag)) {
      return;
    } else {
      tempList[id].tags.push(tag);
    }

    setList(tempList);
    setListApi(tempList);
    addNewTagToList(tag);
  };

  const removeTag = (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    if (tempList[id].tags.includes(tag)) {
      tempList[id].tags.splice(tempList[id].tags.indexOf(tag), 1);
    }

    setList(tempList);
    setListApi(tempList);
    if (!Object.keys(generateTagsList(tempList)).includes(tag))
      removeTagFromList(tag);
  };

  const highlightTag = (tag: string) => {
    let tempTagsList: { [tag: string]: boolean } = {};
    Object.assign(tempTagsList, tagsList);

    tempTagsList[tag] = !tempTagsList[tag];

    setTagsList(tempTagsList);
  };

  const getFilteredList = (
    tempTagsList: {
      [tag: string]: boolean;
    },
    listParam: { [itemId: string]: ListItem },
    isFilteringInclusiveParam: boolean
  ): { [itemId: string]: ListItem } => {
    if (!Object.values(tempTagsList).some((tagHighlight) => tagHighlight)) {
      return listParam;
    }

    let filteredList: { [itemId: string]: ListItem } = {};
    const activeTags = Object.keys(tempTagsList).filter(
      (tag) => tempTagsList[tag]
    );

    if (isFilteringInclusiveParam) {
      activeTags.forEach((tag) => {
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
      activeTags.forEach((tag) => {
        Object.keys(listParam).forEach((listItemId) => {
          if (!listParam[listItemId].tags.includes(tag)) {
            delete filteredList[listItemId];
          }
        });
      });
    }

    return filteredList;
  };

  return (
    <MainPage>
      <TagSidePanel>
        <TagElement
          style={{
            gridTemplateColumns: "80% 20%",
          }}
        >
          <div>
            Filters Used:{" "}
            {Object.keys(tagsList).filter((tag) => tagsList[tag]).length}
          </div>
          <FilteringTypeElement
            style={{
              width: "4rem",
              backgroundColor: isShowCompleted ? "lightgray" : "transparent",
              borderLeft: "lightgray solid 2px",
              borderRadius: "0rem 0.4rem  0rem 0rem",
            }}
            onClick={() => {
              setIsShowCompleted(!isShowCompleted);
            }}
          >
            <img src={CompletedCheckMark} style={{ height: "2rem" }} />
          </FilteringTypeElement>
        </TagElement>
        <TagElement
          style={{
            gridTemplateColumns: "50% 50%",
          }}
        >
          <FilteringTypeElement
            style={{
              backgroundColor: isFilteringInclusive
                ? "transparent"
                : "lightgrey",
            }}
            onClick={() => {
              setIsFilteringInclusive(false);
            }}
          >
            <img src={ExclusiveDiagram} style={{ height: "2rem" }} />
          </FilteringTypeElement>
          <FilteringTypeElement
            style={{
              backgroundColor: isFilteringInclusive
                ? "lightgrey"
                : "transparent",
            }}
            onClick={() => {
              setIsFilteringInclusive(true);
            }}
          >
            <img src={InclusiveDiagram} style={{ height: "2rem" }} />
          </FilteringTypeElement>
        </TagElement>
        {Object.keys(tagsList)
          .filter((tag) => tag !== "Completed")
          .map((tag) => (
            <TagElement
              key={tag}
              style={{
                backgroundColor: tagsList[tag] ? "lightgrey" : "transparent",
              }}
              onClick={() => highlightTag(tag)}
            >
              {tag}
            </TagElement>
          ))}
      </TagSidePanel>
      <ListPanel onClick={createNewListItem}>
        {Object.keys(getFilteredList(tagsList, list, isFilteringInclusive))
          .length !== 0 &&
          Object.keys(getFilteredList(tagsList, list, isFilteringInclusive))
            .filter(
              (id) =>
                !list[id].tags.includes("Completed") ||
                (list[id].tags.includes("Completed") && isShowCompleted)
            )
            .map((id) => (
              <ListElement key={id} onClick={(e) => e.stopPropagation()}>
                <img
                  src={
                    list[id].tags.includes("Completed")
                      ? CompletedCheckMark
                      : UncompletedCheckMark
                  }
                  style={{ height: "1.2rem", marginRight: "1rem" }}
                  onClick={() => {
                    if (list[id].tags.includes("Completed")) {
                      removeTag(id, "Completed");
                    } else {
                      addTag(id, "Completed");
                    }
                  }}
                />
                <ListElementInputField
                  value={list[id].summary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setListItemSummary(id, e.target.value);
                  }}
                  onFocus={() => handleItemFocus(list[id])}
                />
              </ListElement>
            ))}
      </ListPanel>
      {focusedListItemId !== "0" && list[focusedListItemId] && (
        <ItemDetailsPanel>
          <DetailsSummary>
            <img
              src={
                list[focusedListItemId].tags.includes("Completed")
                  ? CompletedCheckMark
                  : UncompletedCheckMark
              }
              style={{
                height: "1em",
                display: "block",
                cursor: "pointer",
                justifySelf: "start",
                alignSelf: "start",
              }}
              onClick={() => {
                if (list[focusedListItemId].tags.includes("Completed")) {
                  removeTag(focusedListItemId, "Completed");
                } else {
                  addTag(focusedListItemId, "Completed");
                }
              }}
            />
            {!isSummaryFocused && (
              <div
                onClick={() => setIsSummaryFocused(true)}
                style={{ justifySelf: "start" }}
              >
                {list[focusedListItemId].summary}
              </div>
            )}
            {isSummaryFocused && (
              <DetailsSummaryInput
                value={list[focusedListItemId].summary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setListItemSummary(focusedListItemId, e.target.value);
                }}
                onBlur={() => setIsSummaryFocused(false)}
                autoFocus={true}
              />
            )}
          </DetailsSummary>
          <DetailsTags>
            <span style={{ padding: "0.25rem 0.25rem 0.25rem 0rem" }}>
              Tags:
            </span>
            {list[focusedListItemId].tags.map((tag) => (
              <TagChip
                key={tag}
                onClick={() => removeTag(focusedListItemId, tag)}
              >
                {tag}
              </TagChip>
            ))}
            {list[focusedListItemId].summary.length > 0 && (
              <AddTagChip
                style={{
                  width: (newTag.length + 1 < 2 ? 2 : newTag.length + 1) + "ch",
                  cursor: "pointer",
                }}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder='+'
                onBlur={() => {
                  if (newTag !== "+" && newTag !== "") {
                    addTag(focusedListItemId, newTag);
                  }
                  setNewTag("");
                }}
              />
            )}
          </DetailsTags>
          <div
            style={{
              width: "33rem",
              textAlign: "start",
              color: "black",
              fontSize: "1.2rem",
            }}
          >
            Description:
          </div>
          <DescriptionArea
            value={list[focusedListItemId].description}
            onChange={(e) => {
              setListItemDescription(focusedListItemId, e.target.value);
            }}
          />
          <TagChip
            onClick={() => removeElement(focusedListItemId)}
            style={{
              cursor: "pointer",
              width: "5rem",
              display: "grid",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <img
              src={TrashCanIcon}
              style={{ height: "1rem", display: "block", cursor: "pointer" }}
            />
          </TagChip>
        </ItemDetailsPanel>
      )}
    </MainPage>
  );
}

const DescriptionArea = styled.textarea`
  width: 33rem;
  height: 35rem;
  background-color: lightgrey;
  color: black;
  border-width: 0px;
  display: block;
  resize: vertical;
  border-radius: 0.5rem;
  outline: none;
  box-sizing: border-box;
  padding: 1rem;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
`;

const DetailsSummaryInput = styled.input`
  background-color: transparent;
  font: inherit;
  outline: none;
  border-width: 0px;
  color: inherit;
  justify-self: start;
  &:focus {
    border-bottom: solid black 1px;
  }
  width: 31rem;
`;

const MainPage = styled.div`
  height: 100vh;
  background-color: lightgrey;
  display: grid;
  grid-template-columns: 20% 50% 30%;
`;

const TagSidePanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: aliceblue;
  display: grid;
  justify-items: center;
  align-content: start;
`;

const TagElement = styled.div`
  border-width: 2px;
  border-style: solid;
  border-color: lightgrey;
  color: black;
  height: 3rem;
  display: grid;
  align-items: center;
  justify-items: center;
  width: 20rem;
  margin: 0.1rem;
  &:first-child {
    border-radius: 0.5rem 0.5rem 0rem 0rem;
    margin-top: 1rem;
  }
  &:last-child {
    border-radius: 0rem 0rem 0.5rem 0.5rem;
    margin-bottom: 2rem;
    &:first-child {
      border-radius: 0.5rem 0.5rem 0.5rem 0.5rem;
      margin-top: 1rem;
    }
  }
  cursor: pointer;
`;

const ListPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  display: grid;
  justify-items: center;
  align-content: start;
`;

const ListElement = styled.div`
  margin: 0.1rem;
  color: darkslategrey;
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

const ListElementInputField = styled.input`
  background-color: transparent;
  border-width: 0px 0px 1px 0px;
  color: inherit;
  outline: none;
  width: 47rem;
`;

const ItemDetailsPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: aliceblue;
  display: grid;
  justify-items: center;
  align-content: start;
`;

const DetailsSummary = styled.div`
  color: Black;
  font-size: 22pt;
  padding: 1rem;
  min-height: 2rem;
  display: grid;
  width: 33rem;
  grid-template-columns: 7% 93%;
  justify-items: center;
  align-items: center;
`;

const DetailsTags = styled.div`
  color: black;
  text-align: start;
  padding: 1rem;
  padding-top: 0rem;
  width: 33rem;
  font-size: 1.2rem;
  display: flex;
  flex-wrap: wrap;
`;

const AddTagChip = styled.input`
  background-color: lightgrey;
  color: #000000be;
  border-radius: 0.2rem;
  border-width: 0px;
  text-align: center;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  height: 1.5rem;
  padding: 0.25rem;
`;

const TagChip = styled.div`
  height: 1.5rem;
  background-color: lightgrey;
  color: #000000be;
  border-radius: 0.2rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: url(${TrashCanCursor}), crosshair;
  padding: 0.25rem;
  font-size: 1rem;
  text-align: center;
  text-justify: center;
  &:nth-child(2) {
    margin-left: 0.5rem;
  }
`;

const FilteringTypeElement = styled.div`
  background-color: lightgrey;
  border: none;
  height: 3rem;
  display: grid;
  align-items: center;
  justify-items: center;
  width: 10rem;
  margin: 0rem;
  cursor: pointer;
`;
