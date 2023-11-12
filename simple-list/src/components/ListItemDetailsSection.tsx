import { styled } from "styled-components";
import { ListItem } from "../App";
import CheckedCheckmarkBlack from "../assets/CheckedCheckmarkBlack.png";
import UncheckedCheckmarkBlack from "../assets/UncheckedCheckmarkBlack.png";
import CheckedCheckmarkWhite from "../assets/CheckedCheckmarkWhite.png";
import UncheckedCheckmarkWhite from "../assets/UncheckedCheckmarkWhite.png";
import { useState } from "react";
import TrashCanBlack from "../assets/TrashCanBlack.png";
import TrashCanWhite from "../assets/TrashCanWhite.png";

interface ListItemdetailSectionProps {
  list: { [itemId: string]: ListItem };
  removeListItem: Function;
  focusedListItemId: string;
  removeTagFromListItem: Function;
  addTagToListItem: Function;
  setListItemSummary: Function;
  setList: Function;
  generateTagsList: Function;
  removeTagFromTagList: Function;
  addTagToTagList: Function;
  theme: string;
}

export default function ListItemDetailSection(
  props: ListItemdetailSectionProps
) {
  const [isSummaryFocused, setIsSummaryFocused] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [newCustomFieldInput, setNewCustomFieldInput] = useState("");

  const [areFieldsBeingEdited, setAreFieldsBeingEdited] = useState(false);

  const setListItemDescription = (id: string, description: string) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, props.list);

    tempList[id].description = description;

    props.setList(tempList);
  };

  const editTagInListItem = (
    id: string,
    currentTag: string,
    newTag: string
  ) => {
    let tempList: { [itemId: string]: ListItem } = {};
    Object.assign(tempList, props.list);

    if (tempList[id].tags.includes(currentTag)) {
      tempList[id].tags[tempList[id].tags.indexOf(currentTag)] = newTag;
    }

    props.setList(tempList);
    if (!Object.keys(props.generateTagsList(tempList)).includes(currentTag)) {
      props.removeTagFromTagList(currentTag);
    }
    props.addTagToTagList(newTag);
  };

  return (
    <ListItemDetailsPanel>
      <ListItemDetailsSummary>
        <img
          src={
            props.list[props.focusedListItemId].tags.includes("Completed")
              ? props.theme === "dark"
                ? CheckedCheckmarkWhite
                : CheckedCheckmarkBlack
              : props.theme === "dark"
              ? UncheckedCheckmarkWhite
              : UncheckedCheckmarkBlack
          }
          style={{
            height: "1em",
            display: "block",
            cursor: "pointer",
            justifySelf: "start",
            alignSelf: "start",
          }}
          onClick={() => {
            if (
              props.list[props.focusedListItemId].tags.includes("Completed")
            ) {
              props.removeTagFromListItem(props.focusedListItemId, "Completed");
            } else {
              props.addTagToListItem(props.focusedListItemId, "Completed");
            }
          }}
        />
        {!isSummaryFocused && (
          <div
            onClick={() => setIsSummaryFocused(true)}
            style={{ justifySelf: "start" }}
          >
            {props.list[props.focusedListItemId].summary}
          </div>
        )}
        {isSummaryFocused && (
          <DetailsSummaryInput
            value={props.list[props.focusedListItemId].summary}
            onChange={(e) =>
              props.setListItemSummary(props.focusedListItemId, e.target.value)
            }
            onBlur={() => setIsSummaryFocused(false)}
            autoFocus={true}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        )}
      </ListItemDetailsSummary>
      <ListItemDetailsFieldElement
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          border: "none",
        }}
      >
        Created:{" "}
        {new Date(
          +(
            props.list[props.focusedListItemId].tags
              .find((e) => e.includes("$Created="))
              ?.split("=")[1] ?? 0
          )
        ).toLocaleDateString("en-GB")}
        <span
          style={{ justifySelf: "end", cursor: "pointer" }}
          onClick={() => setAreFieldsBeingEdited(!areFieldsBeingEdited)}
        >
          {areFieldsBeingEdited ? "Save" : "Edit"}
        </span>
      </ListItemDetailsFieldElement>
      {props.list[props.focusedListItemId].tags
        .filter((e) => e[0] === "$" && !e.includes("$Created="))
        .map((tag) => (
          <ListItemDetailsFieldElement
            key={tag.split("$")[1].split("=")[0]}
            style={
              !areFieldsBeingEdited
                ? {
                    border: "none",
                  }
                : { display: "grid", gridTemplateColumns: "auto auto" }
            }
          >
            <span>
              <span>{tag.split("$")[1].split("=")[0]}</span>
              {": "}
              <ListItemDetailsFieldInput
                value={tag.split("$")[1].split("=")[1]}
                style={{
                  width:
                    (tag.split("$")[1].split("=")[1]?.length + 1 < 2
                      ? 2
                      : tag.split("$")[1].split("=")[1]?.length + 1) + "ch",
                }}
                onChange={(e) =>
                  editTagInListItem(
                    props.focusedListItemId,
                    tag,
                    `\$${tag.split("$")[1].split("=")[0]}=${e.target.value}`
                  )
                }
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                placeholder='value'
              ></ListItemDetailsFieldInput>
            </span>
            {areFieldsBeingEdited && (
              <img
                src={props.theme === "dark" ? TrashCanWhite : TrashCanBlack}
                onClick={() =>
                  props.removeTagFromListItem(props.focusedListItemId, tag)
                }
                style={{
                  height: "1rem",
                  display: "block",
                  cursor: "pointer",
                  justifySelf: "end",
                  alignSelf: "center",
                }}
              />
            )}
          </ListItemDetailsFieldElement>
        ))}
      <ListItemDetailsFieldElement style={{ border: "none" }}>
        <ListItemDetailsFieldInput
          placeholder='Add new field'
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={() => {
            if (newCustomFieldInput !== "") {
              props.addTagToListItem(
                props.focusedListItemId,
                "$" + newCustomFieldInput + "="
              );
            }
            setNewCustomFieldInput("");
          }}
          value={newCustomFieldInput}
          onChange={(e) => setNewCustomFieldInput(e.target.value)}
        ></ListItemDetailsFieldInput>
      </ListItemDetailsFieldElement>
      <ListItemDetailsTags>
        <span style={{ padding: "0.25rem 0.25rem 0.25rem 0rem" }}>Tags:</span>
        {props.list[props.focusedListItemId].tags
          .filter((e) => e[0] != "$")
          .map((tag) => (
            <TagChip key={tag}>
              <span>
                {tag}
                <span
                  onClick={() =>
                    props.removeTagFromListItem(props.focusedListItemId, tag)
                  }
                  style={{
                    opacity: "0.7",
                    marginLeft: "1rem",
                    cursor: "pointer",
                  }}
                >
                  {"x"}
                </span>
              </span>
            </TagChip>
          ))}
        {props.list[props.focusedListItemId].summary.length > 0 && (
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
                props.addTagToListItem(props.focusedListItemId, newTag);
              }
              setNewTag("");
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        )}
      </ListItemDetailsTags>
      <DescriptionTitle>Description:</DescriptionTitle>
      <DescriptionArea
        value={props.list[props.focusedListItemId].description}
        onChange={(e) => {
          setListItemDescription(props.focusedListItemId, e.target.value);
        }}
      />
      <TagChip
        onClick={() => props.removeListItem(props.focusedListItemId)}
        style={{
          cursor: "pointer",
          width: "5rem",
          display: "grid",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <img
          src={props.theme === "dark" ? TrashCanWhite : TrashCanBlack}
          style={{ height: "1rem", display: "block", cursor: "pointer" }}
        />
      </TagChip>
    </ListItemDetailsPanel>
  );
}

const DescriptionTitle = styled.div`
  width: 33rem;
  text-align: start;
  font-size: 1.2rem;
`;

const DescriptionArea = styled.textarea`
  width: 33rem;
  height: 35rem;
  background-color: ${(props) => props.theme.background};
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

const ListItemDetailsPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${(props) => props.theme.panel};
  display: grid;
  justify-items: center;
  align-content: start;
`;

const ListItemDetailsSummary = styled.div`
  font-size: 22pt;
  padding: 1rem;
  min-height: 2rem;
  display: grid;
  width: 33rem;
  grid-template-columns: 7% 93%;
  justify-items: center;
  align-items: center;
`;

const ListItemDetailsTags = styled.div`
  align-items: center;
  text-align: start;
  padding: 1rem;
  width: 33rem;
  font-size: 1.2rem;
  display: flex;
  flex-wrap: wrap;
`;

const AddTagChip = styled.input`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  border-radius: 0.2rem;
  border-width: 0px;
  text-align: center;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  height: 1.5rem;
  padding: 0.25rem;
`;

const TagChip = styled.div`
  height: 2rem;
  padding: 0 0.4rem 0 0.4rem;
  background-color: ${(props) => props.theme.background};
  border-radius: 0.2rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  display: grid;
  align-items: center;
  &:nth-child(2) {
    margin-left: 0.5rem;
  }
`;

const ListItemDetailsFieldElement = styled.div`
  padding: 0.25rem 0.25rem 0.25rem 0rem;
  text-align: start;
  width: 33rem;
  font-size: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.text};
  &:nth-child(2) {
    margin-bottom: 0.4rem;
  }
`;

const ListItemDetailsFieldInput = styled.input`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  border-radius: 0.2rem;
  border-width: 0px;
  text-align: center;
  margin-right: 0.5rem;
  height: 1.2rem;
  min-width: 4rem;
  padding: 0.25rem;
`;

const DetailsSummaryInput = styled.input`
  background-color: transparent;
  font: inherit;
  outline: none;
  border-width: 0px;
  color: inherit;
  justify-self: start;
  &:focus {
    border-bottom: solid ${(props) => props.theme.text} 1px;
  }
  width: 31rem;
`;
