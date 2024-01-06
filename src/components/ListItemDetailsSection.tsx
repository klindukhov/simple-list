import { styled } from "styled-components";
import { ListItem } from "../App";
import { useState } from "react";
import React from "react";
import {
  Check,
  CheckCircle,
  Circle,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react";

import { RemirrorEditor } from "./ui/RemirrorEditor";

interface ListItemdetailSectionProps {
  list: { [itemId: string]: ListItem };
  removeListItem: (id: string) => void;
  focusedListItemId: string;
  removeTagFromListItem: (id: string, tag: string) => void;
  addTagToListItem: (id: string, tag: string) => void;
  setListItemSummary: (id: string, summary: string) => void;
  setList: (list: { [itemId: string]: ListItem }) => void;
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
    const tempList: { [itemId: string]: ListItem } = { ...props.list };

    tempList[id].description = description;

    props.setList(tempList);
  };

  const editTagInListItem = (
    id: string,
    currentTag: string,
    newTag: string
  ) => {
    const tempList: { [itemId: string]: ListItem } = { ...props.list };

    if (tempList[id].tags.includes(currentTag)) {
      tempList[id].tags[tempList[id].tags.indexOf(currentTag)] = newTag;
    }

    props.setList(tempList);
  };

  const toggleCompleted = () => {
    if (props.list[props.focusedListItemId].tags.includes("Completed")) {
      props.removeTagFromListItem(props.focusedListItemId, "Completed");
    } else {
      props.addTagToListItem(props.focusedListItemId, "Completed");
    }
  };

  return (
    <>
      {(props.focusedListItemId === "0" ||
        !props.list[props.focusedListItemId] ||
        Object.keys(props.list).length === 0 ||
        props.list[props.focusedListItemId].summary === "") && (
        <ListItemDetailsPanelPlaceholder>
          <PlaceholderDiv />
          <RemirrorEditor state='' setState={() => {}} />
        </ListItemDetailsPanelPlaceholder>
      )}
      {props.focusedListItemId !== "0" &&
        props.list[props.focusedListItemId] &&
        props.list[props.focusedListItemId].summary !== "" && (
          <ListItemDetailsPanel>
            <ListItemDetailsSummary>
              <SummaryCheckmark onClick={() => toggleCompleted()}>
                {props.list[props.focusedListItemId].tags.includes(
                  "Completed"
                ) && <CheckCircle size={"1em"} />}
                {!props.list[props.focusedListItemId].tags.includes(
                  "Completed"
                ) && (
                  <>
                    <Circle size={"1em"} />
                    <CheckmarkWrapper>
                      <CheckCircle size={"1em"} />
                    </CheckmarkWrapper>
                  </>
                )}
              </SummaryCheckmark>
              {!isSummaryFocused && (
                <UnfocusedSummary onClick={() => setIsSummaryFocused(true)}>
                  {props.list[props.focusedListItemId].summary}
                </UnfocusedSummary>
              )}
              {isSummaryFocused && (
                <DetailsSummaryInput
                  value={props.list[props.focusedListItemId].summary}
                  onChange={(e) =>
                    props.setListItemSummary(
                      props.focusedListItemId,
                      e.target.value
                    )
                  }
                  onBlur={() => setIsSummaryFocused(false)}
                  autoFocus={true}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                />
              )}
            </ListItemDetailsSummary>
            <ListItemDetailsFieldElementCreated>
              <Txt>
                Created:{" "}
                {new Date(
                  +(
                    props.list[props.focusedListItemId].tags
                      .find((e) => e.includes("$Created="))
                      ?.split("=")[1] ?? 0
                  )
                ).toLocaleDateString("en-GB")}
              </Txt>
              <EditButton
                onClick={() => setAreFieldsBeingEdited(!areFieldsBeingEdited)}
              >
                {areFieldsBeingEdited && (
                  <>
                    <Txt>Save</Txt>
                    <Check />
                  </>
                )}
                {!areFieldsBeingEdited && (
                  <>
                    <Txt>Edit</Txt>
                    <PencilSimple />
                  </>
                )}
              </EditButton>
            </ListItemDetailsFieldElementCreated>
            <ListItemFiedls $areFieldsBeingEdited={areFieldsBeingEdited}>
              {props.list[props.focusedListItemId].tags
                .filter((e) => e[0] === "$" && !e.includes("$Created="))
                .map((tag) => (
                  <React.Fragment key={tag.split("$")[1].split("=")[0]}>
                    <Txt>{tag.split("$")[1].split("=")[0] + ": "}</Txt>
                    <ListItemDetailsFieldInput
                      value={tag.split("$")[1].split("=")[1]}
                      onChange={(e) =>
                        editTagInListItem(
                          props.focusedListItemId,
                          tag,
                          `$${tag.split("$")[1].split("=")[0]}=${
                            e.target.value
                          }`
                        )
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                      placeholder='value'
                    />
                    {areFieldsBeingEdited && (
                      <DeleteField
                        onClick={() =>
                          props.removeTagFromListItem(
                            props.focusedListItemId,
                            tag
                          )
                        }
                      >
                        <Trash />
                      </DeleteField>
                    )}
                  </React.Fragment>
                ))}
              {areFieldsBeingEdited && (
                <>
                  <ListItemDetailsFieldInput
                    placeholder='Add new field'
                    onKeyDown={(e) =>
                      e.key === "Enter" && e.currentTarget.blur()
                    }
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
                  />
                  <div></div>
                  <div></div>
                </>
              )}
              <Txt>Tags:</Txt>
              <ListItemDetailsTagsList
                onClick={() => document.getElementById("addTagChip")?.focus()}
              >
                {props.list[props.focusedListItemId].tags
                  .filter((e) => e[0] != "$")
                  .map((tag) => (
                    <TagChip key={tag}>
                      <span>
                        <TagChipText>{tag}</TagChipText>
                        <DeleteTag
                          onClick={() =>
                            props.removeTagFromListItem(
                              props.focusedListItemId,
                              tag
                            )
                          }
                        >
                          <X size={"0.8rem"} />
                        </DeleteTag>
                      </span>
                    </TagChip>
                  ))}
                {props.list[props.focusedListItemId].summary.length > 0 && (
                  <AddTagChip
                    id='addTagChip'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onBlur={() => {
                      if (newTag !== "+" && newTag !== "" && newTag !== " ") {
                        props.addTagToListItem(props.focusedListItemId, newTag);
                      }
                      setNewTag("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.currentTarget.blur();
                        document.getElementById("addTagChip")?.focus();
                      }
                    }}
                  />
                )}
              </ListItemDetailsTagsList>
            </ListItemFiedls>
            <DescriptionTitle>Description:</DescriptionTitle>
            <ListItemDetailDescription>
              <RemirrorEditor
                key={props.focusedListItemId}
                state={props.list[props.focusedListItemId].description}
                setState={(state: string) => {
                  setListItemDescription(props.focusedListItemId, state);
                }}
              />
            </ListItemDetailDescription>
            <DeleteDiv>
              <DeleteElementChip
                onClick={() => props.removeListItem(props.focusedListItemId)}
              >
                <Trash size={"1.3rem"} />
                <Txt>Delete Item</Txt>
              </DeleteElementChip>
            </DeleteDiv>
          </ListItemDetailsPanel>
        )}
    </>
  );
}

const Txt = styled.span`
  cursor: default;
  padding-top: 0.3rem;
`;

const ListItemDetailsPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${(props) => props.theme.panel};
  width: 100%;
  grid-template-columns: 100%;
  grid-template-rows: auto auto auto auto 1fr;
  display: grid;
  justify-items: center;
  align-content: start;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SummaryCheckmark = styled.span`
  height: 1em;
  display: block;
  cursor: pointer;
  justify-self: start;
  align-self: start;
  &:hover {
    opacity: 0.7;
  }
`;

const CheckmarkWrapper = styled.span`
  position: relative;
  top: calc(-1em - 0.5rem);
  opacity: 0;
  &:hover {
    opacity: 1;
  }
`;

const UnfocusedSummary = styled.div`
  justify-self: start;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
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
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListItemDetailsSummary = styled.div`
  font-size: 22pt;
  margin: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  min-height: 2rem;
  display: grid;
  width: 90%;
  grid-template-columns: 7% 93%;
  justify-items: center;
  align-items: center;
  &:hover {
    background-color: ${(props) => props.theme.background};
  }
  box-sizing: border-box;
`;

const ListItemDetailsFieldElementCreated = styled.div`
  padding: 0.25rem 0.25rem 0.25rem 0rem;
  text-align: start;
  width: 90%;
  font-size: 0.8rem;
  display: grid;
  grid-template-columns: auto auto;
  margin-bottom: 0.4rem;
  opacity: 0.7;
`;

const EditButton = styled.div`
  width: 3rem;
  justify-self: end;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.3rem;
  margin-bottom: -0.3rem;
  border-radius: 0.3rem;
  &:hover {
    background-color: ${(props) => props.theme.background};
  }
`;

const ListItemFiedls = styled.div<{ $areFieldsBeingEdited: boolean }>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$areFieldsBeingEdited
      ? "fit-content(20%) auto 4%"
      : "fit-content(20%) auto"};
  text-align: start;
  width: 90%;
  grid-column-gap: 1rem;
  grid-row-gap: 0.5rem;
  align-items: center;
`;

const ListItemDetailsFieldInput = styled.input`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  border-radius: 0.5rem;
  border-width: 0px;
  margin-right: 0.5rem;
  height: 2rem;
  width: 100%;
  padding: 0rem 0.4rem 0 0.4rem;
  box-sizing: border-box;
  justify-self: start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const ListItemDetailsTagsList = styled.div`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  border-radius: 0.5rem;
  border-width: 0px;
  margin-right: 0.5rem;
  min-height: 2.5rem;
  width: 100%;
  padding: 0.35rem 0.4rem 0.35rem 0.4rem;
  justify-self: start;
  font-size: 1rem;
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5rem;
  align-items: center;
  box-sizing: border-box;
  cursor: text;
`;

const TagChip = styled.div`
  height: 1.8rem;
  padding: 0.1rem 0.4rem 0 0.4rem;
  background-color: ${(props) => props.theme.panel};
  border-radius: 0.5rem;
  margin-right: 0.5rem;
  margin-bottom: 0rem;
  font-size: 1rem;
  text-align: center;
  display: grid;
  align-items: center;
  align-content: center;
  max-width: 20rem;
  &:hover {
    background-color: ${(props) => props.theme.panel};
  }
`;

const TagChipText = styled.span`
  margin: 0px;
  padding: 0px;
  border: none;
  max-width: 18rem;
  display: inline-flex;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteTag = styled.span`
  opacity: 0.7;
  margin-left: 1rem;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const AddTagChip = styled.input`
  background-color: transparent;
  box-sizing: border-box;
  color: inherit;
  padding-bottom: 0.2rem;
  border-radius: 0.5rem;
  border-width: 0px;
  text-align: start;
  height: 1.8rem;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  max-width: 20rem;
  &:hover {
    opacity: 0.7;
  }
`;

const DescriptionTitle = styled.div`
  width: 90%;
  text-align: start;
  font-size: 1.2rem;
  margin-top: 2rem;
  cursor: default;
`;

const ListItemDetailDescription = styled.div`
  width: 90%;
  border-width: 0px;
  display: block;
  resize: vertical;
  border-radius: 0.5rem;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
`;

const DeleteField = styled.div`
  height: 1rem;
  display: block;
  cursor: pointer;
  justify-self: end;
  align-self: center;
  &:hover {
    opacity: 0.7;
  }
`;

const DeleteDiv = styled.div`
  height: 1fr;
  display: grid;
  align-content: end;
`;

const DeleteElementChip = styled.div`
  background-color: ${(props) => props.theme.background};
  border-radius: 0.5rem;
  height: 2rem;
  cursor: pointer;
  text-align: center;
  width: 8rem;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: space-around;
  align-content: center;
  align-items: center;
  margin-bottom: 2rem;
  &:hover {
    opacity: 0.7;
  }
`;

const ListItemDetailsPanelPlaceholder = styled.div`
  background-color: ${(props) => props.theme.panel};
`;

const PlaceholderDiv = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.panel};
  margin-bottom: -100%;
  position: fixed;
  z-index: 5;
`;
