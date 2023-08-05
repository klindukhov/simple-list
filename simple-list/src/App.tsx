import { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getList as getListApi, setList as setListApi } from "./api";
import TrashCanCursor from "./assets/TrashCanCursor24fat.png";

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
  const [focusedListItem, setFocusedListItem] = useState<ListItem>({
    id: "0",
    summary: "",
    description: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

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

  const createNewListItem = () => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, list);

    if (
      Object.keys(list).length > 0 &&
      list[Object.keys(list)[Object.keys(list).length - 1]].summary === ""
    ) {
      delete tempList[Object.keys(list)[Object.keys(list).length - 1]];
    } else {
      const newId = uuidv4();
      tempList[newId] = {
        id: newId,
        summary: "",
        description: "",
        tags: ["Created"],
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
    setFocusedListItem(listItem);
  };

  //temporary as would not make sense after ading description, tags
  const deleteEmptyOnBlur = (id: string, summary: string) => {
    if (summary === "") removeElement(id);
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

  return (
    <MainPage>
      <TagSidePanel>
        {Object.keys(tagsList).map((tag) => (
          <TagElement>{tag}</TagElement>
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
                onBlur={() => deleteEmptyOnBlur(id, list[id].summary)}
              />
            </ListElement>
          ))}
      </ListPanel>
      <ItemDetailsPanel>
        <DetailsSummary>{focusedListItem.summary}</DetailsSummary>
        <DetailsTags>
          {focusedListItem.tags.map((t) => (
            <TagChip
              style={{ width: t.length + "ch" }}
              onClick={() => removeTag(focusedListItem.id, t)}
            >
              {t}
            </TagChip>
          ))}
          {focusedListItem.summary.length > 0 && (
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
                  addTag(focusedListItem.id, newTag);
                }
                setNewTag("");
              }}
            />
          )}
        </DetailsTags>
      </ItemDetailsPanel>
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
  background-color: lightgrey;
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
`;
