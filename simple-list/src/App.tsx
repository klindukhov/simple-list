import { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getList as getListApi, setList as setListApi } from "./api";

export interface ListItem {
  id: string;
  summary: string;
  description: string;
  tags: string[];
}

export default function App() {
  useEffect(() => {
    getListApi().then((list) => setList(list));
  }, []);

  const [list, setList] = useState<ListItem[]>([]);
  const [focusedListItem, setFocusedItemList] = useState<ListItem>({
    id: "0",
    summary: "",
    description: "",
    tags: [],
  });

  const setListItemSummary = (id: string, summary: string) => {
    let tempList = [...list];
    let listItemIndex = list.findIndex((el) => el.id === id);
    if (!listItemIndex && listItemIndex !== 0) return;
    tempList[listItemIndex].summary = summary;
    setList(tempList);
    setListApi(tempList);
  };

  const createNewListItem = () => {
    if (list.length > 0 && list[list.length - 1].summary === "") {
      let tempList = [...list];
      tempList.pop();
      setList(tempList);
      setListApi(tempList);
      return;
    }
    let tempList = [...list];
    tempList.push({
      id: uuidv4(),
      summary: "",
      description: "",
      tags: ["newElement"],
    });
    setList(tempList);
    setListApi(tempList);
  };

  const removeElement = (id: string) => {
    let tempList = [...list];
    tempList.splice(
      tempList.findIndex((e) => e.id === id),
      1
    );
    setList(tempList);
    setListApi(tempList);
  };

  const handleItemFocus = (listItem: ListItem) => {
    window.addEventListener("keypress", (e) => {
      if (e.key === "Enter") createNewListItem();
    });
    setFocusedItemList(listItem);
  };

  //temporary as would not make sense after ading description, tags
  const deleteEmptyOnBlur = (id: string, summary: string) => {
    if (summary === "") removeElement(id);
  };

  return (
    <MainPage>
      <TagSidePanel>
        {list.length !== 0 &&
          list
            .map((li) => li.tags)
            .reduce((allTags, tags) => [...allTags, ...tags])
            .map((tag) => (
              <TagElement>
                <InputField style={{ textAlign: "center" }} value={tag} />
              </TagElement>
            ))}
      </TagSidePanel>
      <ListPanel onClick={createNewListItem}>
        {list.length !== 0 &&
          list.map((le) => (
            <ListElement key={le.id} onClick={(e) => e.stopPropagation()}>
              <ListElementInputField
                value={le.summary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setListItemSummary(le.id, e.target.value);
                }}
                onFocus={() => handleItemFocus(le)}
                onBlur={() => deleteEmptyOnBlur(le.id, le.summary)}
              />
            </ListElement>
          ))}
      </ListPanel>
      <ItemDetailsPanel>
        <DetailsSummary>{focusedListItem.summary}</DetailsSummary>
        <DetailsTags></DetailsTags>
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

const InputField = styled.input`
  background-color: transparent;
  border-color: transparent;
  color: inherit;
  outline: none;
  min-width: 1rem;
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
  font-size: 20pt;
  padding-top: 1rem;
`;

const DetailsTags = styled.div``;
