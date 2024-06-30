import { styled } from "styled-components";
import { useState } from "react";
import React from "react";
import { Check, PencilSimple, Trash, X } from "@phosphor-icons/react";

import { RemirrorEditor } from "./ui/RemirrorEditor";
import PreviewCheckmark from "./ui/PreviewCheckMark";
import { CaretLeftRotaiton, SquareButton } from "./ui/common";
import AutocompleteInput from "./ui/AutocompleteInput";
import { IndexItem, ListApi } from "../api";

export interface ListItemdetailSectionProps {
  list: { [itemId: string]: IndexItem };
  listApi: ListApi;
  focusedListItemId: string;
  focusedItemDescription: string;
  viewMode: string;
  tagsList: string[];
}

export default function ListItemDetailSection(
  props: ListItemdetailSectionProps
) {
  const [isSummaryFocused, setIsSummaryFocused] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [newCustomFieldInput, setNewCustomFieldInput] = useState("");

  const [areFieldsBeingEdited, setAreFieldsBeingEdited] = useState(false);

  const [isRemirrorMenuOpen, setIsRemirrorMenuOpen] = useState(false);

  const getIsItemCompleted = (id: string) => {
    return props.list[id].tags.includes(
      props.list[id].tags.find((tag) => tag.includes("Completed")) ??
        "Completed"
    );
  };

  const toggleCompleted = () => {
    if (getIsItemCompleted(props.focusedListItemId)) {
      props.listApi.deleteListItemTag(
        props.focusedListItemId,
        props.list[props.focusedListItemId].tags.find((tag) =>
          tag.includes("Completed")
        ) ?? "Completed"
      );
    } else {
      props.listApi.addListItemTag(
        props.focusedListItemId,
        "$Completed=" + Date.now()
      );
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.listApi.setListItemSummary(
      props.focusedListItemId,
      e.target.value === ""
        ? " "
        : e.target.value.length > 2 && e.target.value[0] === " "
        ? e.target.value.substring(1)
        : e.target.value
    );
  };

  const getHintTags = (tagsList: string[], stringToMatch: string): string[] => {
    return tagsList.filter((tag) => {
      return (
        tag[0] !== "$" &&
        tag.toLowerCase().includes(stringToMatch.toLowerCase()) &&
        !props.list[props.focusedListItemId].tags
          .filter((e) => e[0] != "$")
          .includes(tag)
      );
    });
  };

  return (
    <>
      {(props.focusedListItemId === "0" ||
        !props.list[props.focusedListItemId] ||
        Object.keys(props.list).length === 0 ||
        props.list[props.focusedListItemId].summary === "") && (
        <ListItemDetailsPanelPlaceholder>
          <PlaceholderDiv />
          <RemirrorEditor state="" setState={() => {}} showMenu={false} />
        </ListItemDetailsPanelPlaceholder>
      )}
      {props.focusedListItemId !== "0" &&
        props.list[props.focusedListItemId] &&
        props.list[props.focusedListItemId].summary !== "" && (
          <ListItemDetailsPanel>
            <ListItemDetailsSummary>
              <PreviewCheckmark
                onClick={() => toggleCompleted()}
                height="2rem"
                checked={props.list[props.focusedListItemId].tags.includes(
                  props.list[props.focusedListItemId].tags.find((tag) =>
                    tag.includes("Completed")
                  ) ?? "Completed"
                )}
              />
              {!isSummaryFocused && (
                <UnfocusedSummary onClick={() => setIsSummaryFocused(true)}>
                  {props.list[props.focusedListItemId].summary}
                </UnfocusedSummary>
              )}
              {isSummaryFocused && (
                <DetailsSummaryInput
                  value={props.list[props.focusedListItemId].summary}
                  onChange={handleSummaryChange}
                  onBlur={() => setIsSummaryFocused(false)}
                  autoFocus={true}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                />
              )}
            </ListItemDetailsSummary>
            {props.viewMode === "Task" && (
              <ListItemDetailsFieldElementCreated>
                <CreatedUpdatedDiv>
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

                  <Txt>
                    Updated:{" "}
                    {new Date(
                      +(
                        props.list[props.focusedListItemId].tags
                          .find((e) => e.includes("$Updated="))
                          ?.split("=")[1] ?? 0
                      )
                    ).toLocaleDateString("en-GB")}
                  </Txt>
                  {getIsItemCompleted(props.focusedListItemId) && (
                    <Txt>
                      Completed:{" "}
                      {new Date(
                        +(
                          props.list[props.focusedListItemId].tags
                            .find((e) => e.includes("$Completed="))
                            ?.split("=")[1] ?? 0
                        )
                      ).toLocaleDateString("en-GB")}
                    </Txt>
                  )}
                </CreatedUpdatedDiv>
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
            )}
            <ListItemFiedls $areFieldsBeingEdited={areFieldsBeingEdited}>
              {props.viewMode === "Task" &&
                props.list[props.focusedListItemId].tags
                  .filter(
                    (e) =>
                      e[0] === "$" &&
                      !e.includes("$Created=") &&
                      !e.includes("$Completed=") &&
                      !e.includes("$Updated=")
                  )
                  .map((tag) => (
                    <React.Fragment key={tag.split("$")[1].split("=")[0]}>
                      <Txt>{tag.split("$")[1].split("=")[0] + ": "}</Txt>
                      <ListItemDetailsFieldInput
                        value={tag.split("$")[1].split("=")[1]}
                        onChange={(e) =>
                          props.listApi.setProperty(
                            props.focusedListItemId,
                            tag.split("$")[1].split("=")[0],
                            e.target.value
                          )
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
                        placeholder="value"
                      />
                      {areFieldsBeingEdited && (
                        <DeleteField
                          onClick={() =>
                            props.listApi.deleteListItemTag(
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
                    placeholder="Add new field"
                    onKeyDown={(e) =>
                      e.key === "Enter" && e.currentTarget.blur()
                    }
                    onBlur={() => {
                      if (newCustomFieldInput !== "") {
                        props.listApi.addListItemTag(
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
                            props.listApi.deleteListItemTag(
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
                    $width={
                      (newTag.length + 1 < 2 ? 2 : newTag.length + 1) + "ch"
                    }
                  >
                    <AutocompleteInput
                      hintList={getHintTags(props.tagsList, newTag)}
                      id="addTagChip"
                      value={newTag}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewTag((e.target as HTMLInputElement).value)
                      }
                      onHintApply={(hint: string) => {
                        props.listApi.addListItemTag(
                          props.focusedListItemId,
                          hint
                        );
                        setNewTag("");
                      }}
                      onBlur={() => {
                        if (newTag !== "+" && newTag !== "" && newTag !== " ") {
                          props.listApi.addListItemTag(
                            props.focusedListItemId,
                            newTag
                          );
                        }
                        setNewTag("");
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.currentTarget.blur();
                          document.getElementById("addTagChip")?.focus();
                          setNewTag("");
                        }
                      }}
                    />
                  </AddTagChip>
                )}
              </ListItemDetailsTagsList>
            </ListItemFiedls>
            {props.viewMode === "Task" && (
              <DescriptionTitle>
                <Txt>Description:</Txt>
                <SquareButton
                  onClick={() => setIsRemirrorMenuOpen(!isRemirrorMenuOpen)}
                >
                  <CaretLeftRotaiton $isRotated={isRemirrorMenuOpen} />
                </SquareButton>
              </DescriptionTitle>
            )}

            <ListItemDetailDescription>
              <RemirrorEditor
                key={props.focusedListItemId}
                state={props.listApi.focusedListItemDescription}
                setState={(state: string) => {
                  props.listApi.setListItemDescription(
                    props.focusedListItemId,
                    state
                  );
                }}
                showMenu={
                  isRemirrorMenuOpen ||
                  (!isRemirrorMenuOpen && props.viewMode === "Note")
                }
              />
            </ListItemDetailDescription>
            {props.viewMode === "Task" && (
              <DeleteDiv>
                <DeleteElementChip
                  onClick={() => {
                    props.listApi.deleteListItem(props.focusedListItemId);
                  }}
                >
                  <Trash size={"1.3rem"} />
                  <Txt>Delete Item</Txt>
                </DeleteElementChip>
              </DeleteDiv>
            )}
          </ListItemDetailsPanel>
        )}
    </>
  );
}

const CreatedUpdatedDiv = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  justify-content: start;
  grid-column-gap: 0.5rem;
`;

const Txt = styled.span`
  box-sizing: border-box;
  cursor: default;
  padding-top: 0.3rem;
`;

const ListItemDetailsPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${(props) => props.theme.panel};
  min-width: 100%;
  grid-template-columns: 100%;
  grid-template-rows: auto auto ${(props) =>
      props.theme.viewMode === "Task" && " auto auto "} 1fr;
  display: grid;
  justify-items: center;
  align-content: start;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const UnfocusedSummary = styled.div`
  justify-self: start;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 100%;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
`;

const DetailsSummaryInput = styled.input`
  background-color: transparent;
  font: inherit;
  outline: none;
  border-width: 0px;
  color: inherit;
  justify-self: start;
  &:focus {
    border-bottom: ${(props) =>
      props.theme.viewMode === "Task" && "1px solid " + props.theme.text};
  }
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListItemDetailsSummary = styled.div`
  font-size: 2rem;
  margin: 0.5rem;
  margin-bottom: ${(props) => props.theme.viewMode === "Note" && "0rem"};
  padding: 0.5rem;
  border-radius: ${(props) => props.theme.viewMode === "Task" && "0.5rem"};
  min-height: 3rem;
  display: grid;
  width: ${(props) => (props.theme.viewMode === "Task" ? "90%" : "100%")};
  grid-template-columns: 2rem 1fr;
  grid-column-gap: 1rem;
  justify-items: start;
  align-items: center;
  &:hover {
    background-color: ${(props) =>
      props.theme.viewMode === "Task" && props.theme.background};
  }
  border-bottom: ${(props) =>
    props.theme.viewMode === "Note" && "3px solid " + props.theme.background};
  box-sizing: border-box;
`;

const ListItemDetailsFieldElementCreated = styled.div`
  padding: 0rem 0.25rem 0.25rem
    ${(props) => (props.theme.viewMode === "Task" ? "0rem" : "0.25rem")};
  text-align: start;
  width: ${(props) => (props.theme.viewMode === "Task" ? "90%" : "100%")};
  font-size: 0.8rem;
  display: grid;
  grid-template-columns: auto auto;
  margin-bottom: ${(props) =>
    props.theme.viewMode === "Task" ? "0.4rem" : "0rem"};
  opacity: 0.7;
  box-sizing: border-box;
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

const ListItemFiedls = styled.div<{
  $areFieldsBeingEdited: boolean;
}>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$areFieldsBeingEdited
      ? "fit-content(20%) auto 4%"
      : "fit-content(20%) auto"};
  text-align: start;
  width: ${(props) => (props.theme.viewMode === "Task" ? "90%" : "100%")};
  grid-column-gap: 1rem;
  grid-row-gap: 0.5rem;
  align-items: center;
  border-bottom: ${(props) =>
    props.theme.viewMode === "Note" && "3px solid " + props.theme.background};
  padding-left: ${(props) => props.theme.viewMode === "Note" && "1rem"};
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
  border: none;
  outline: none;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const ListItemDetailsTagsList = styled.div`
  background-color: ${(props) =>
    props.theme.viewMode === "Task" && props.theme.background};
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
  & > div {
    background-color: ${(props) =>
      props.theme.viewMode === "Note" && props.theme.background};
  }
`;

const TagChip = styled.div`
  box-sizing: border-box;
  height: 1.8rem;
  padding: 0.1rem 0.4rem 0 0.4rem;
  background-color: ${(props) => props.theme.panel};
  border-radius: 0.5rem;
  margin-right: 0.5rem;
  margin-bottom: 0rem;
  font-size: 1rem;
  text-align: end;
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

const AddTagChip = styled.div<{ $width: string }>`
  display: grid;
  align-content: center;
  background-color: transparent !important;
  & > div > input {
    background-color: transparent;
    box-sizing: border-box;
    color: inherit;
    border-radius: 0.5rem;
    border-width: 0px;
    text-align: start;
    height: 1.8rem;
    font-size: 1rem;
    outline: none;
    width: ${(props) => props.$width};
    max-width: 20rem;
    &:hover {
      opacity: 0.7;
    }
  }
`;

const DescriptionTitle = styled.div`
  width: 90%;
  display: grid;
  grid-template-columns: auto auto;
  justify-content: start;
  align-items: center;
  grid-column-gap: 0.5rem;
  text-align: start;
  font-size: 1.2rem;
  margin-top: 2rem;
  cursor: default;
`;

const ListItemDetailDescription = styled.div`
  width: ${(props) => (props.theme.viewMode === "Task" ? "90%" : "100%")};
  border-width: 0px;
  display: block;
  resize: vertical;
  border-radius: ${(props) =>
    props.theme.viewMode === "Task" ? "0.5rem" : "0rem"};
  outline: none;
  box-sizing: border-box;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  & > div > div > div > div.remirror-editor-wrapper > div {
    ${(props) =>
      props.theme.viewMode !== "Task" && "max-height: calc(100vh - 4rem);"}
  }
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
