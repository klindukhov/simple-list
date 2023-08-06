import { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getList as getListApi, setList as setListApi } from "./api";
import TrashCanCursor from "./assets/TrashCanCursor24fat.png";
import InclusiveDiagram from "./assets/InclusiveDiagramFat.png";
import ExclusiveDiagram from "./assets/ExclusiveDiagramFat.png";

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
  const [focusedListItemId, setFocusedListItemId] = useState<string>("0");
  const [newTag, setNewTag] = useState("");

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

  const setListItemSummary = async (id: string, summary: string) => {
    let tempList: { [itemId: string]: ListItem } = await getListApi();

    tempList[id].summary = summary;

    setList(await getFilteredList(tagsList, tempList, isFilteringInclusive));
    setListApi(tempList);
  };

  const createNewListItem = async () => {
    let tempList: { [itemId: string]: ListItem } = await getListApi();

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

    setList(await getFilteredList(tagsList, tempList, isFilteringInclusive));
    setListApi(tempList);
  };

  const removeElement = async (id: string) => {
    let tempList: { [itemId: string]: ListItem } = await getListApi();

    delete tempList[id];

    setList(await getFilteredList(tagsList, tempList, isFilteringInclusive));
    setListApi(tempList);
  };

  const handleItemFocus = (listItem: ListItem) => {
    window.addEventListener("keypress", (e) => {
      if (e.key === "Enter") createNewListItem();
    });
    setFocusedListItemId(listItem.id);
  };

  const addTag = async (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = await getListApi();

    if (tempList[id].tags.includes(tag)) {
      return;
    } else {
      tempList[id].tags.push(tag);
    }

    setList(await getFilteredList(tagsList, tempList, isFilteringInclusive));
    setListApi(tempList);
    addNewTagToList(tag);
  };

  const removeTag = async (id: string, tag: string) => {
    let tempList: { [itemId: string]: ListItem } = await getListApi();

    if (tempList[id].tags.includes(tag)) {
      tempList[id].tags.splice(tempList[id].tags.indexOf(tag), 1);
    }

    setList(await getFilteredList(tagsList, tempList, isFilteringInclusive));
    setListApi(tempList);
    if (!Object.keys(generateTagsList(tempList)).includes(tag))
      removeTagFromList(tag);
  };

  const highlightTag = async (tag: string) => {
    let tempTagsList: { [tag: string]: boolean } = {};
    Object.assign(tempTagsList, tagsList);

    tempTagsList[tag] = !tempTagsList[tag];

    setTagsList(tempTagsList);
    setList(
      await getFilteredList(
        tempTagsList,
        await getListApi(),
        isFilteringInclusive
      )
    );
  };

  const getFilteredList = async (
    tempTagsList: {
      [tag: string]: boolean;
    },
    fullList: { [itemId: string]: ListItem },
    isFilteringInclusiveLocal: boolean
  ): Promise<{ [itemId: string]: ListItem }> => {
    if (!Object.values(tempTagsList).some((tagHighlight) => tagHighlight)) {
      return fullList;
    }

    let filteredList: { [itemId: string]: ListItem } = {};
    const activeTags = Object.keys(tempTagsList).filter(
      (tag) => tempTagsList[tag]
    );

    if (isFilteringInclusiveLocal) {
      activeTags.forEach((tag) => {
        Object.keys(fullList).forEach((listItemId) => {
          if (
            fullList[listItemId].tags.includes(tag) &&
            !Object.keys(filteredList).includes(listItemId)
          ) {
            filteredList[listItemId] = fullList[listItemId];
          }
        });
      });
    } else {
      Object.assign(filteredList, fullList);
      activeTags.forEach((tag) => {
        Object.keys(fullList).forEach((listItemId) => {
          if (!fullList[listItemId].tags.includes(tag)) {
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
        <FilteringType>
          <FilteringTypeElement
            style={{
              backgroundColor: isFilteringInclusive
                ? "transparent"
                : "lightgrey",
            }}
            onClick={async () => {
              setIsFilteringInclusive(false);
              setList(
                await getFilteredList(tagsList, await getListApi(), false)
              );
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
            onClick={async () => {
              setIsFilteringInclusive(true);
              setList(
                await getFilteredList(tagsList, await getListApi(), true)
              );
            }}
          >
            <img src={InclusiveDiagram} style={{ height: "2rem" }} />
          </FilteringTypeElement>
        </FilteringType>
        {Object.keys(tagsList).map((tag) => (
          <TagElement
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
        {Object.keys(list).length !== 0 &&
          Object.keys(list).map((id) => (
            <ListElement key={id} onClick={(e) => e.stopPropagation()}>
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
          <DetailsSummary>{list[focusedListItemId].summary}</DetailsSummary>
          <DetailsTags>
            {list[focusedListItemId].tags.map((t) => (
              <TagChip
                style={{ width: t.length + "ch" }}
                onClick={() => removeTag(focusedListItemId, t)}
              >
                {t}
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
        </ItemDetailsPanel>
      )}
    </MainPage>
  );
}

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
  width: 50rem;
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
`;

const DetailsTags = styled.div`
  padding: 1rem;
  padding-top: 0rem;
`;

const AddTagChip = styled.input`
  background-color: lightgrey;
  color: #000000be;
  border-radius: 0.2rem;
  border-width: 0px;
  text-align: center;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  height: 1.2rem;
  display: inline-block;
  vertical-align: baseline;
`;

const TagChip = styled.div`
  display: inline-block;
  height: 1.2rem;
  background-color: lightgrey;
  color: #000000be;
  border-radius: 0.2rem;
  text-align: center;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: url(${TrashCanCursor}), crosshair;
  padding: 0.1rem;
`;

const FilteringType = styled.div`
  margin: 0rem;
  padding: 0rem;
  border-width: 2px;
  border-style: solid;
  border-color: lightgrey;
  margin-top: 1rem;
  margin-bottom: 0.1rem;
  display: grid;
  grid-template-columns: 50% 50%;
  width: 20rem;
  column-gap: 0rem;
  border-radius: 0.5rem 0.5rem 0rem 0rem;
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
  &:first-child {
    border-radius: 0.5rem 0rem 0rem 0rem;
  }
  &:last-child {
    border-radius: 0rem 0.5rem 0rem 0rem;
  }
  cursor: pointer;
`;
