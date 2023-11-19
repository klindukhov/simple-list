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

interface ListItemdetailSectionProps {
  list: { [itemId: string]: ListItem };
  removeListItem: Function;
  focusedListItemId: string;
  removeTagFromListItem: Function;
  addTagToListItem: Function;
  setListItemSummary: Function;
  setList: Function;
  generateTagsList: Function;
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
  };

  return (
    <ListItemDetailsPanel>
      <ListItemDetailsSummary>
        <SummaryCheckmark
          onClick={() => {
            if (
              props.list[props.focusedListItemId].tags.includes("Completed")
            ) {
              props.removeTagFromListItem(props.focusedListItemId, "Completed");
            } else {
              props.addTagToListItem(props.focusedListItemId, "Completed");
            }
          }}
        >
          {props.list[props.focusedListItemId].tags.includes("Completed") && (
            <CheckCircle size={"1em"} />
          )}
          {!props.list[props.focusedListItemId].tags.includes("Completed") && (
            <Circle size={"1em"} />
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
              props.setListItemSummary(props.focusedListItemId, e.target.value)
            }
            onBlur={() => setIsSummaryFocused(false)}
            autoFocus={true}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        )}
      </ListItemDetailsSummary>
      <ListItemDetailsFieldElementCreated>
        Created:{" "}
        {new Date(
          +(
            props.list[props.focusedListItemId].tags
              .find((e) => e.includes("$Created="))
              ?.split("=")[1] ?? 0
          )
        ).toLocaleDateString("en-GB")}
        <EditButton
          onClick={() => setAreFieldsBeingEdited(!areFieldsBeingEdited)}
        >
          {areFieldsBeingEdited && (
            <>
              <Check />
              Save
            </>
          )}
          {!areFieldsBeingEdited && (
            <>
              <PencilSimple />
              Edit
            </>
          )}
        </EditButton>
      </ListItemDetailsFieldElementCreated>
      <ListItemFiedls $areFieldsBeingEdited={areFieldsBeingEdited}>
        {props.list[props.focusedListItemId].tags
          .filter((e) => e[0] === "$" && !e.includes("$Created="))
          .map((tag) => (
            <React.Fragment key={tag.split("$")[1].split("=")[0]}>
              <div>{tag.split("$")[1].split("=")[0] + ": "}</div>
              <ListItemDetailsFieldInput
                value={tag.split("$")[1].split("=")[1]}
                onChange={(e) =>
                  editTagInListItem(
                    props.focusedListItemId,
                    tag,
                    `\$${tag.split("$")[1].split("=")[0]}=${e.target.value}`
                  )
                }
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                placeholder='value'
              />
              {areFieldsBeingEdited && (
                <DeleteField
                  onClick={() =>
                    props.removeTagFromListItem(props.focusedListItemId, tag)
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
            />
            <div></div>
            <div></div>
          </>
        )}
        Tags:
        <ListItemDetailsTagsList>
          {props.list[props.focusedListItemId].tags
            .filter((e) => e[0] != "$")
            .map((tag) => (
              <TagChip key={tag}>
                <span>
                  <TagChipText>{tag}</TagChipText>
                  <DeleteTag
                    onClick={() =>
                      props.removeTagFromListItem(props.focusedListItemId, tag)
                    }
                  >
                    <X size={"0.8rem"} />
                  </DeleteTag>
                </span>
              </TagChip>
            ))}
          {props.list[props.focusedListItemId].summary.length > 0 && (
            <AddTagChip
              $width={(newTag.length + 1 < 2 ? 2 : newTag.length + 1) + "ch"}
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
        </ListItemDetailsTagsList>
      </ListItemFiedls>
      <DescriptionTitle>Description:</DescriptionTitle>
      <DescriptionArea
        value={props.list[props.focusedListItemId].description}
        onChange={(e) => {
          setListItemDescription(props.focusedListItemId, e.target.value);
        }}
      />
      <DeleteElementChip
        onClick={() => props.removeListItem(props.focusedListItemId)}
      >
        <Trash size={"1.3rem"} />
      </DeleteElementChip>
    </ListItemDetailsPanel>
  );
}

const ListItemDetailsPanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${(props) => props.theme.panel};
  display: grid;
  justify-items: center;
  align-content: start;
`;

const SummaryCheckmark = styled.span`
  height: 1em;
  display: block;
  cursor: pointer;
  justify-self: start;
  align-self: start;
`;

const UnfocusedSummary = styled.div`
  justify-self: start;
  overflow-wrap: break-word;
  hyphens: auto;
  width: 31rem;
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
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
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

const ListItemDetailsFieldElementCreated = styled.div`
  padding: 0.25rem 0.25rem 0.25rem 0rem;
  text-align: start;
  width: 33rem;
  font-size: 0.8rem;
  display: grid;
  grid-template-columns: auto auto;
  margin-bottom: 0.4rem;
  opacity: 0.7;
`;

const EditButton = styled.span`
  justify-self: end;
  cursor: pointer;
`;

const ListItemFiedls = styled.div<{ $areFieldsBeingEdited: boolean }>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.$areFieldsBeingEdited
      ? "fit-content(20%) auto 4%"
      : "fit-content(20%) auto"};
  text-align: start;
  width: 33rem;
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
`;

const TagChip = styled.div`
  height: 1.7rem;
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
`;

const AddTagChip = styled.input<{ $width: string }>`
  background-color: ${(props) => props.theme.panel};
  color: inherit;
  border-radius: 0.5rem;
  border-width: 0px;
  text-align: center;
  height: 1.7rem;
  cursor: pointer;
  outline: none;
  width: ${(props) => props.$width};
  max-width: 20rem;
`;

const DescriptionTitle = styled.div`
  width: 33rem;
  text-align: start;
  font-size: 1.2rem;
  margin-top: 2rem;
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

const DeleteField = styled.div`
  height: 1rem;
  display: block;
  cursor: pointer;
  justify-self: end;
  align-self: center;
`;

const DeleteElementChip = styled.div`
  background-color: ${(props) => props.theme.background};
  border-radius: 0.5rem;
  height: 2rem;
  cursor: pointer;
  width: 5rem;
  display: grid;
  justify-content: center;
  align-content: center;
`;
