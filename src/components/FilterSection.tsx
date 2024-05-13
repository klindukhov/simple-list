import { styled } from "styled-components";
import Tooltip from "./ui/Tooltip";
import { Filter, ListItem } from "../App";
import {
  DownloadSimple,
  Eye,
  EyeSlash,
  Folder,
  Funnel,
  Intersect,
  MagnifyingGlass,
  Moon,
  SortAscending,
  SortDescending,
  SquareHalf,
  Sun,
  Trash,
  Unite,
  UploadSimple,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import React from "react";
import { CaretLeftRotaiton, SquareButton, WideButton } from "./ui/common";
import {
  EMPTY_FILTER_TEMPLATE,
  FILTER_PROPERTY_OPERATORS,
  FILTER_TAG_OPERATORS,
} from "../filters";

interface FilterSectionProps {
  list: { [itemId: string]: ListItem };
  searchBarValue: string;
  setSearchBarValue: (value: string) => void;
  fieldsList: { [tag: string]: boolean };
  setSortByList: (value: { [tag: string]: boolean }) => void;
  isSortAsc: boolean;
  toggleIsSortAsc: () => void;
  tagsList: string[];
  isShowingCompleted: boolean;
  toggleIsShowingCompleted: () => void;
  isFilteringMatchAny: boolean;
  setIsFilteringMatchAny: (value: boolean) => void;
  theme: string;
  toggleTheme: () => void;
  tempFilterSet: { [filterId: string]: Filter };
  setTempFilterSet: (filterset: { [filterId: string]: Filter }) => void;
  addFilterToFilterSet: (filter: Filter) => void;
  removeFilterFromFilterSet: (filterId: string) => void;
  editFilter: (filter: Filter) => void;
  savedFilters: { [filtersetName: string]: { [filterId: string]: Filter } };
  addSavedFilter: (
    filtersetName: string,
    filterset: { [filterId: string]: Filter }
  ) => void;
  removeSavedFilter: (filteName: string) => void;
  toggleViewMode: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectNewSaveFile: () => void;
}

export default function FilterSection(props: FilterSectionProps) {
  const exportList = () => {
    const fileData = JSON.stringify(props.list);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "simpleListExport.json";
    link.href = url;
    link.click();
  };

  const handleSortChange = (selectedTag: string) => {
    const tempFieldsList: { [tag: string]: boolean } = { ...props.fieldsList };
    for (const tag in tempFieldsList) {
      tempFieldsList[tag as keyof typeof tempFieldsList] = tag === selectedTag;
    }
    props.setSortByList(tempFieldsList);
  };

  const [isFiltersetBeingSaved, setIsFiltersetBeingSaved] = useState(false);

  const [newFilter, setNewFilter] = useState<Filter>(EMPTY_FILTER_TEMPLATE);
  const [isFilterBeingEdited, setIsFilterBeingEdited] = useState<{
    [filterId: string]: boolean;
  }>();
  useEffect(() => {
    const tempIsFilterBeingEdited: { [filterId: string]: boolean } =
      Object.fromEntries([
        ["new", false],
        Object.entries(props.tempFilterSet).map(
          (entry) => ((entry[1] as unknown as boolean) = false)
        ),
      ]);

    setIsFilterBeingEdited(tempIsFilterBeingEdited);
  }, [props.tempFilterSet]);

  const handleNewFilterFieldChange = (selectedField: string) => {
    const tempFilter: Filter = { ...newFilter };

    tempFilter.fieldToFilter = selectedField;
    tempFilter.operator = "";

    setNewFilter(tempFilter);
  };

  const handleNewFilterOperatorChange = (selectedOperator: string) => {
    const tempFilter: Filter = { ...newFilter };

    tempFilter.operator = selectedOperator;

    setNewFilter(tempFilter);
  };

  const handleExpectedValueChange = (fieldValue: string) => {
    const tempFilter: Filter = { ...newFilter };

    tempFilter.expectedValue = fieldValue;

    setNewFilter(tempFilter);
  };

  const handleSubmitFilter = (id?: string) => {
    if (!id || id === "" || id === "new") {
      if (
        !newFilter.expectedValue ||
        !newFilter.operator ||
        !newFilter.fieldToFilter
      )
        return;
      props.addFilterToFilterSet(newFilter);
      setNewFilter(EMPTY_FILTER_TEMPLATE);
    } else {
      props.editFilter(newFilter);
      setNewFilter(EMPTY_FILTER_TEMPLATE);
    }
  };

  const toggleIsFilterBeingEdited = (id: string) => {
    setNewFilter(
      id === "new" ? EMPTY_FILTER_TEMPLATE : props.tempFilterSet[id]
    );
    const tempIsFilterBeingEdited = { ...isFilterBeingEdited };
    Object.keys(tempIsFilterBeingEdited).forEach(
      (filterId) => (tempIsFilterBeingEdited[filterId] = false)
    );
    tempIsFilterBeingEdited[id] = true;
    setIsFilterBeingEdited(tempIsFilterBeingEdited);
  };

  const handleCancelFilter = (id?: string) => {
    if (id) {
      const tempIsFilterBeingEdited = { ...isFilterBeingEdited };
      tempIsFilterBeingEdited[id] = false;
      setIsFilterBeingEdited(tempIsFilterBeingEdited);
    }
    setNewFilter(EMPTY_FILTER_TEMPLATE);
  };

  const [newSavedFilterName, setNewSavedFilterName] = useState("");
  const handleNewFiltersetSave = () => {
    if (newSavedFilterName !== "" && newSavedFilterName !== " ") {
      props.addSavedFilter(newSavedFilterName, props.tempFilterSet);
      setIsFiltersetBeingSaved(false);
      setNewSavedFilterName("");
    } else {
      setIsFiltersetBeingSaved(false);
    }
  };

  const [isDisplayingsavedFilters, setIsDisplayingSavedFilters] =
    useState(false);

  return (
    <>
      <HiddenInput
        type='file'
        id='importFileInput'
        onChange={(e) => props.handleFileUpload(e)}
        accept='.json'
      />
      <FilteringSidePanel>
        <ExportImportPanel>
          <SquareButton onClick={() => props.toggleTheme()}>
            {props.theme === "dark" && <Sun />}
            {props.theme === "light" && <Moon />}
          </SquareButton>
          <WideButton onClick={exportList}>
            {"Export  "}
            <UploadSimple />
          </WideButton>
          <WideButton
            onClick={() => document.getElementById("importFileInput")?.click()}
          >
            Import
            <DownloadSimple />
          </WideButton>
          <SquareButton onClick={props.selectNewSaveFile}>
            <Folder />
          </SquareButton>
          <SquareButtonJustifyEnd onClick={props.toggleViewMode}>
            <SquareHalf size={"1.2rem"} />{" "}
          </SquareButtonJustifyEnd>
        </ExportImportPanel>
        <SearchBarElement>
          <InputField
            onChange={(e) => props.setSearchBarValue(e.target.value)}
            id='searhBarInput'
          />
          {props.searchBarValue === "" && (
            <MagnifyingGlassWrapper
              onClick={() => document.getElementById("searhBarInput")?.focus()}
            >
              <MagnifyingGlass size={"1.5rem"} />
            </MagnifyingGlassWrapper>
          )}
        </SearchBarElement>
        <SortByElement>
          <Txt>Sort by:</Txt>
          <SelectInput onChange={(e) => handleSortChange(e.target.value)}>
            {props.fieldsList &&
              Object.keys(props.fieldsList).map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
          </SelectInput>
          <SquareButtonJustifyEnd onClick={() => props.toggleIsSortAsc()}>
            {props.isSortAsc && <SortAscending size={"1.5rem"} />}
            {!props.isSortAsc && <SortDescending size={"1.5rem"} />}
          </SquareButtonJustifyEnd>
        </SortByElement>
        <FiltersUsedElement>
          <ShowCompletedDiv>
            <Txt>
              {Object.keys(props.savedFilters).filter(
                (filterName) => filterName !== "tempFilterSet"
              ).length > 0
                ? "Saved filters"
                : "Filters"}
            </Txt>
            {Object.keys(props.savedFilters).filter(
              (filterName) => filterName !== "tempFilterSet"
            ).length > 0 && (
              <SquareButton
                onClick={() =>
                  setIsDisplayingSavedFilters(!isDisplayingsavedFilters)
                }
              >
                <CaretLeftRotaiton $isRotated={isDisplayingsavedFilters} />
              </SquareButton>
            )}
          </ShowCompletedDiv>
          <SquareButtonJustifyEnd
            onClick={() => props.toggleIsShowingCompleted()}
          >
            <Tooltip
              text={
                props.isShowingCompleted ? "Hide completed" : "Show completed"
              }
            >
              <>
                {!props.isShowingCompleted && <EyeSlash size={"1.5rem"} />}
                {props.isShowingCompleted && <Eye size={"1.5rem"} />}
              </>
            </Tooltip>
          </SquareButtonJustifyEnd>
        </FiltersUsedElement>
        <SavedFilters>
          {props.savedFilters &&
            isDisplayingsavedFilters &&
            Object.keys(props.savedFilters)
              .filter((filterName) => filterName !== "tempFilterSet")
              .map((filterName) => (
                <SavedFilterDiv>
                  <InputField disabled value={filterName} />{" "}
                  <WideButton
                    onClick={() =>
                      props.setTempFilterSet(props.savedFilters[filterName])
                    }
                  >
                    Apply
                  </WideButton>
                  <SquareButtonJustifyEnd
                    onClick={() => props.removeSavedFilter(filterName)}
                  >
                    <Trash />
                  </SquareButtonJustifyEnd>
                </SavedFilterDiv>
              ))}
        </SavedFilters>

        <MatchAnyAllElement>
          <FilteringMatch
            $isFilteringMatchAny={props.isFilteringMatchAny}
            onClick={() => props.setIsFilteringMatchAny(false)}
          >
            Match all
            <Intersect size={"1.5rem"} />
          </FilteringMatch>
          <FilteringMatch
            $isFilteringMatchAny={props.isFilteringMatchAny}
            onClick={() => props.setIsFilteringMatchAny(true)}
          >
            Match any
            <Unite size={"1.5rem"} />
          </FilteringMatch>
        </MatchAnyAllElement>
        {props.tempFilterSet && Object.keys(props.tempFilterSet).length > 0 && (
          <SaveFilterSetDiv>
            {!isFiltersetBeingSaved && (
              <WideButtonStart onClick={() => setIsFiltersetBeingSaved(true)}>
                Save current filters
              </WideButtonStart>
            )}
            {isFiltersetBeingSaved && (
              <FilterSetNameInput>
                <InputField
                  placeholder='Filterset name'
                  onChange={(e) => setNewSavedFilterName(e.target.value)}
                />
                <WideButton onClick={() => handleNewFiltersetSave()}>
                  {newSavedFilterName === "" || newSavedFilterName === " "
                    ? "Cancel"
                    : "Save"}
                </WideButton>
              </FilterSetNameInput>
            )}
          </SaveFilterSetDiv>
        )}
        <FiltersContainer>
          {props.tempFilterSet &&
            [...Object.values(props.tempFilterSet), EMPTY_FILTER_TEMPLATE].map(
              (filter: Filter) => (
                <React.Fragment key={filter.id}>
                  {isFilterBeingEdited &&
                    filter.id === "new" &&
                    !isFilterBeingEdited["new"] && (
                      <WideButton
                        onClick={() => toggleIsFilterBeingEdited("new")}
                      >
                        <Txt>Add filter</Txt>
                        <Funnel />
                      </WideButton>
                    )}
                  {isFilterBeingEdited &&
                    ((filter.id !== "new" && !isFilterBeingEdited[filter.id]) ||
                      isFilterBeingEdited[filter.id]) && (
                      <FilterElement
                        onClick={() =>
                          !isFilterBeingEdited[filter.id] &&
                          toggleIsFilterBeingEdited(filter.id)
                        }
                      >
                        {isFilterBeingEdited &&
                          !isFilterBeingEdited[filter.id] && (
                            <FilterDiv>
                              <FilterFieldDiv>
                                <Txt>{filter.fieldToFilter + ": "}</Txt>
                                <Txt>{filter.operator}</Txt>
                              </FilterFieldDiv>
                              <ExpectedValueDiv>
                                <TxtInlineBlock title={filter.expectedValue}>
                                  {filter.expectedValue}
                                </TxtInlineBlock>
                              </ExpectedValueDiv>
                              <SquareButtonJustifyEnd
                                onClick={() =>
                                  props.removeFilterFromFilterSet(filter.id)
                                }
                              >
                                <Trash />
                              </SquareButtonJustifyEnd>
                            </FilterDiv>
                          )}
                        {isFilterBeingEdited &&
                          isFilterBeingEdited[filter.id] && (
                            <>
                              <SelectInput
                                onChange={(e) =>
                                  handleNewFilterFieldChange(e.target.value)
                                }
                                value={newFilter.fieldToFilter}
                              >
                                <option disabled hidden value={""}>
                                  {"Select field"}
                                </option>
                                {props.fieldsList &&
                                  [
                                    ...Object.keys(props.fieldsList),
                                    "Tags",
                                  ].map((e) => (
                                    <option key={e} value={e}>
                                      {e}
                                    </option>
                                  ))}
                              </SelectInput>
                              <SelectInput
                                onChange={(e) =>
                                  handleNewFilterOperatorChange(e.target.value)
                                }
                                value={newFilter.operator}
                              >
                                <option disabled hidden value={""}>
                                  {"Select operator"}
                                </option>
                                {(newFilter.fieldToFilter === "Tags"
                                  ? Object.keys(FILTER_TAG_OPERATORS)
                                  : Object.keys(FILTER_PROPERTY_OPERATORS)
                                ).map((operator) => (
                                  <option key={operator} value={operator}>
                                    {operator}
                                  </option>
                                ))}
                              </SelectInput>
                              {newFilter.fieldToFilter !== "Tags" && (
                                <InputField
                                  onChange={(e) =>
                                    handleExpectedValueChange(e.target.value)
                                  }
                                  placeholder='Expected value'
                                  value={newFilter.expectedValue}
                                />
                              )}
                              {newFilter.fieldToFilter === "Tags" && (
                                <SelectInput
                                  onChange={(e) =>
                                    handleExpectedValueChange(e.target.value)
                                  }
                                  value={newFilter.expectedValue}
                                >
                                  <option disabled hidden value={""}>
                                    {"Select tag"}
                                  </option>
                                  {["Untagged", ...props.tagsList]
                                    .filter((tag) => tag[0] !== "$")
                                    .map((tag) => (
                                      <option key={tag} value={tag}>
                                        {tag}
                                      </option>
                                    ))}
                                </SelectInput>
                              )}
                              <FilterCreationSaveCancel>
                                <WideButton
                                  onClick={() => handleSubmitFilter(filter.id)}
                                >
                                  Save
                                </WideButton>
                                <WideButton
                                  onClick={() => handleCancelFilter(filter.id)}
                                >
                                  Cancel
                                </WideButton>
                              </FilterCreationSaveCancel>
                            </>
                          )}
                      </FilterElement>
                    )}
                </React.Fragment>
              )
            )}
        </FiltersContainer>
      </FilteringSidePanel>
    </>
  );
}

const HiddenInput = styled.input`
  display: none;
`;

const FilteringSidePanel = styled.div`
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  background-color: ${(props) => props.theme.panel};
  display: grid;
  justify-items: center;
  align-content: start;
  &::-webkit-scrollbar {
    display: none;
  }
  ${(props) => !props.theme.isFilteringPanelOpen && "display: none;"}
`;

const Txt = styled.span`
  box-sizing: border-box;
  padding-top: 0.1rem;
  cursor: default;
`;

const FilteringPanelElement = styled.div`
  box-sizing: border-box;
  height: 2rem;
  width: 95%;
  display: grid;
  align-items: center;
`;

const ExportImportPanel = styled(FilteringPanelElement)`
  grid-template-columns: auto auto auto auto auto;
  box-sizing: border-box;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  padding-left: 2rem;
`;

const WideButtonStart = styled(WideButton)`
  justify-self: start;
`;

const FilteringPanelGroupElement = styled(FilteringPanelElement)`
  border-radius: 0px;
  &:first-child {
    margin-top: 1rem;
    border-radius: 0.5rem 0.5rem 0px 0px;
  }
  &:last-child {
    margin-bottom: 2rem;
    border-radius: 0px 0px 0.5rem 0.5rem;
    &:first-child {
      margin-top: 1rem;
    }
  }
`;

const SearchBarElement = styled(FilteringPanelGroupElement)`
  grid-template-columns: 100%;
  justify-items: center;
  margin-bottom: 0.5rem;
  &:hover {
    & > input {
      background-color: ${(props) => props.theme.background07};
    }
  }
  &:active {
    opacity: 0.7;
  }
`;

const InputField = styled.input`
  color: inherit;
  background-color: ${(props) => props.theme.background};
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 100%;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
`;

const MagnifyingGlassWrapper = styled.div`
  position: relative;
  top: -2rem;
  margin-bottom: -2rem;
  z-index: 2;
  width: auto;
  margin-left: 80%;
  cursor: text;
`;

const SortByElement = styled(FilteringPanelGroupElement)`
  grid-template-columns: 25% 60% 15%;
`;

const SquareButtonJustifyEnd = styled(SquareButton)`
  justify-self: end;
`;

const SelectInput = styled.select`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 100%;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
  &:hover {
    background-color: ${(props) => props.theme.background07};
  }
  &:active {
    opacity: 0.7;
  }
`;

const FiltersUsedElement = styled(FilteringPanelGroupElement)`
  margin-top: 1rem;
  grid-template-columns: 1fr 15%;
`;

const SavedFilters = styled.div`
  width: 95%;
`;

const ShowCompletedDiv = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 0.25rem;
  align-items: center;
  justify-content: start;
`;

const SavedFilterDiv = styled.div`
  background-color: ${(props) => props.theme.background};
  display: grid;
  grid-template-columns: auto auto auto;
  width: 85%;
  justify-self: start;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  & > button {
    &:hover {
      opacity: 0.7;
    }
    &:active {
      opacity: 0.5;
    }
  }
  &:first-child {
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
  }
  &:last-child {
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
`;

const MatchAnyAllElement = styled(FilteringPanelGroupElement)`
  grid-template-columns: 50% 50%;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
`;

const SaveFilterSetDiv = styled.div`
  width: 95%;
  margin-bottom: 0.5rem;
`;

const FiltersContainer = styled.div`
  width: 100%;
  display: grid;
  justify-items: center;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterSetNameInput = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 0.5rem;
`;

const FilteringMatch = styled.div<{
  $isFilteringMatchAny: boolean;
}>`
  border: none;
  height: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
  background-color: ${(props) => props.theme.background};
  grid-template-columns: auto auto;
  column-gap: 1rem;
  &:first-child {
    background-color: ${(props) =>
      !props.$isFilteringMatchAny
        ? props.theme.background
        : props.theme.background05};
    border-bottom-left-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
  }
  &:last-child {
    background-color: ${(props) =>
      props.$isFilteringMatchAny
        ? props.theme.background
        : props.theme.background05};
    border-bottom-right-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  &:hover {
    background-color: ${(props) => props.theme.background07};
  }
  &:active {
    opacity: 0.7;
  }
`;

const FilterElement = styled.div`
  width: 95%;
  background-color: ${(props) => props.theme.background07};
  grid-row-gap: 0.3rem;
  display: grid;
  grid-template-columns: 95%;
  justify-content: center;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
  & > select,
  button,
  input {
    &:hover {
      background-color: ${(props) => props.theme.panel07};
    }
    &:active {
      opacity: 0.7;
    }
  }
  & > select,
  input {
    background-color: ${(props) => props.theme.panel};
  }
  &:first-child {
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
  }
  &:nth-last-child(2) {
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
  &:last-child {
    border-radius: 0.5rem;
  }
`;

const FilterCreationSaveCancel = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
`;

const FilterDiv = styled.div`
  display: grid;
  grid-template-columns: fit-content(50%) auto fit-content(20%);
  grid-column-gap: 0.5rem;
`;

const ExpectedValueDiv = styled.div`
  height: 2rem;
  border-radius: 0.5rem;
  background-color: ${(props) => props.theme.panel};
  display: grid;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-top: 0.1rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
`;

const TxtInlineBlock = styled(Txt)`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
`;

const FilterFieldDiv = styled.div`
  height: 2rem;
  border-radius: 0.5rem;
  display: grid;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding-top: 0.1rem;
  justify-self: start;
  font-size: 0.8rem;
`;
