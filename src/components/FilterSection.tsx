import { styled } from "styled-components";
import Tooltip from "./ui/Tooltip";
import { Filter, ListItem } from "../App";
import {
  DownloadSimple,
  Eye,
  EyeSlash,
  Funnel,
  Gear,
  Intersect,
  MagnifyingGlass,
  Moon,
  SortAscending,
  SortDescending,
  Sun,
  Trash,
  Unite,
  UploadSimple,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import React from "react";

interface FilterSectionProps {
  list: { [itemId: string]: ListItem };
  setList: Function;
  searchBarValue: string;
  setSearchBarValue: Function;
  fieldsList: { [tag: string]: boolean };
  setSortByList: Function;
  isSortAsc: boolean;
  setIsSortAcs: Function;
  tagsList: string[];
  isShowingCompleted: boolean;
  setIsShowingCompleted: Function;
  isFilteringMatchAny: boolean;
  setIsFilteringMatchAny: Function;
  theme: string;
  setTheme: Function;
  filterSet: { [filterId: string]: Filter };
  addFilterToFilterSet: Function;
  removeFilterFromFilterSet: Function;
  editFilter: Function;
}

export const FILTER_OPERATORS = {
  Contains: (actualValue: string, expectedValue: string) => {
    return actualValue.includes(expectedValue);
  },
  "Bigger then": (actualValue: string, expectedValue: string) => {
    return actualValue > expectedValue;
  },
  "Smaller then": (actualValue: string, expectedValue: string) => {
    return actualValue < expectedValue;
  },
  Equals: (actualValue: string, expectedValue: string) => {
    return actualValue === expectedValue;
  },
};

export default function FilterSection(props: FilterSectionProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files) return;
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      let imported: { [itemId: string]: ListItem } = JSON.parse(
        "" + e.target?.result
      );
      let tempList: { [itemId: string]: ListItem } = { ...props.list };
      Object.keys(imported).forEach((key) => {
        tempList[key as keyof typeof tempList] = imported[key];
      });
      props.setList(tempList);
    };
  };

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
    let tempFieldsList: { [tag: string]: boolean } = { ...props.fieldsList };
    for (const tag in tempFieldsList) {
      tempFieldsList[tag as keyof typeof tempFieldsList] = tag === selectedTag;
    }
    props.setSortByList(tempFieldsList);
  };

  const emptyFilter = {
    id: "new",
    fieldToFilter: "",
    operator: "",
    expectedValue: "",
  };
  const [newFilter, setNewFilter] = useState<Filter>(emptyFilter);
  const [isFilterBeingEdited, setIsFilterBeingEdited] = useState<{
    [filterId: string]: boolean;
  }>();
  useEffect(() => {
    let tempIsFilterBeingEdited: { [filterId: string]: boolean } = {};
    Object.keys(props.filterSet).forEach((filterId) => {
      tempIsFilterBeingEdited[filterId] = false;
    });
    tempIsFilterBeingEdited["new"] = false;
    setIsFilterBeingEdited(tempIsFilterBeingEdited);
  }, [props.filterSet]);

  const handleNewFilterFieldChange = (selectedField: string) => {
    let tempFilter: Filter = { ...newFilter };

    tempFilter.fieldToFilter = selectedField;
    if (selectedField === "Tags") {
      tempFilter.operator = "Include";
    }

    setNewFilter(tempFilter);
  };

  const handleNewFilterOperatorChange = (selectedOperator: string) => {
    let tempFilter: Filter = { ...newFilter };

    tempFilter.operator = selectedOperator;

    setNewFilter(tempFilter);
  };

  const handleExpectedValueChange = (fieldValue: string) => {
    let tempFilter: Filter = { ...newFilter };

    tempFilter.expectedValue = fieldValue;

    setNewFilter(tempFilter);
  };

  const handleSaveFilter = (id?: string) => {
    if (!id || id === "" || id === "new") {
      if (
        !newFilter.expectedValue ||
        !newFilter.operator ||
        !newFilter.fieldToFilter
      )
        return;
      props.addFilterToFilterSet(newFilter);
      setNewFilter(emptyFilter);
    } else {
      props.editFilter(newFilter);
      setNewFilter(emptyFilter);
    }
  };

  const toggleIsFilterBeingEdited = (id: string) => {
    setNewFilter(id === "new" ? emptyFilter : props.filterSet[id]);
    const tempIsFilterBeingEdited = { ...isFilterBeingEdited };
    Object.keys(tempIsFilterBeingEdited).forEach(
      (filterId) => (tempIsFilterBeingEdited[filterId] = false)
    );
    tempIsFilterBeingEdited[id] = true;
    setIsFilterBeingEdited(tempIsFilterBeingEdited);
  };

  const handleCancelFilter = (id?: string) => {
    if (id) {
      let tempIsFilterBeingEdited = { ...isFilterBeingEdited };
      tempIsFilterBeingEdited[id] = false;
      setIsFilterBeingEdited(tempIsFilterBeingEdited);
    }
    setNewFilter(emptyFilter);
  };

  return (
    <>
      <HiddenInput
        type='file'
        id='importFileInput'
        onChange={(e) => handleFileUpload(e)}
        accept='.json'
      />
      <FilteringSidePanel>
        <ExportImportPanel>
          <SquareButton
            onClick={() =>
              props.setTheme(props.theme === "dark" ? "light" : "dark")
            }
          >
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
          <SquareButtonJustifyEnd>
            <Gear />{" "}
          </SquareButtonJustifyEnd>
        </ExportImportPanel>
        <SearchBarElement>
          <SearchBarInput
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
          <SquareButtonJustifyEnd
            onClick={() => props.setIsSortAcs(!props.isSortAsc)}
          >
            {props.isSortAsc && <SortAscending size={"1.5rem"} />}
            {!props.isSortAsc && <SortDescending size={"1.5rem"} />}
          </SquareButtonJustifyEnd>
        </SortByElement>
        <FiltersUsedElement>
          <Txt>Filters</Txt>
          <SquareButtonJustifyEnd
            onClick={() =>
              props.setIsShowingCompleted(!props.isShowingCompleted)
            }
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
        {[...Object.values(props.filterSet), emptyFilter].map(
          (filter: Filter) => (
            <React.Fragment key={filter.id}>
              {isFilterBeingEdited &&
                filter.id === "new" &&
                !isFilterBeingEdited["new"] && (
                  <WideButton onClick={() => toggleIsFilterBeingEdited("new")}>
                    Add filter <Funnel />
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
                    {isFilterBeingEdited && !isFilterBeingEdited[filter.id] && (
                      <FilterDiv>
                        <FilterFieldDiv>
                          <Txt>
                            {filter.fieldToFilter +
                              ": " +
                              filter.operator +
                              " "}
                          </Txt>
                        </FilterFieldDiv>
                        <ExpectedValueDiv>
                          <Txt>{filter.expectedValue}</Txt>
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
                    {isFilterBeingEdited && isFilterBeingEdited[filter.id] && (
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
                            [...Object.keys(props.fieldsList), "Tags"].map(
                              (e) => (
                                <option key={e} value={e}>
                                  {e}
                                </option>
                              )
                            )}
                        </SelectInput>
                        <SelectInput
                          onChange={(e) =>
                            handleNewFilterOperatorChange(e.target.value)
                          }
                          disabled={newFilter.fieldToFilter === "Tags"}
                          value={newFilter.operator}
                        >
                          <option disabled hidden value={""}>
                            {"Select operator"}
                          </option>
                          {(newFilter.fieldToFilter === "Tags"
                            ? ["Include"]
                            : Object.keys(FILTER_OPERATORS)
                          ).map((operator) => (
                            <option key={operator} value={operator}>
                              {operator}
                            </option>
                          ))}
                        </SelectInput>
                        {newFilter.fieldToFilter !== "Tags" && (
                          <SearchBarInput
                            onChange={(e) =>
                              handleExpectedValueChange(e.target.value)
                            }
                            placeholder='Expected value'
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
                            {props.tagsList
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
                            onClick={() => handleSaveFilter(filter.id)}
                          >
                            Save
                          </WideButton>
                          <WideButton
                            onClick={() => handleCancelFilter(filter.id)}
                          >
                            <small>Cancel</small>
                          </WideButton>
                        </FilterCreationSaveCancel>
                      </>
                    )}
                  </FilterElement>
                )}
            </React.Fragment>
          )
        )}
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
`;

const Txt = styled.span`
  box-sizing: border-box;
  padding-top: 0.1rem;
  cursor: default;
`;

const FilteringPanelElement = styled.div`
  box-sizing: border-box;
  /* border: 1px solid grey; */
  height: 2rem;
  width: 95%;
  display: grid;
  align-items: center;
`;

const ExportImportPanel = styled(FilteringPanelElement)`
  grid-template-columns: auto auto auto auto;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SquareButton = styled.button`
  background-color: transparent;
  color: inherit;
  outline: none;
  border-radius: 0.5rem;
  border: none;
  width: 2rem;
  height: 2rem;
  box-sizing: border-box;
  display: grid;
  justify-content: center;
  align-content: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background07};
  }
  &:active {
    opacity: 0.7;
  }
`;

const WideButton = styled(SquareButton)`
  height: 2rem;
  width: auto;
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background07};
  }
  &:active {
    opacity: 0.7;
  }
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
  margin-bottom: 2px;
  &:hover {
    & > input {
      background-color: ${(props) => props.theme.background07};
    }
  }
  &:active {
    opacity: 0.7;
  }
`;

const SearchBarInput = styled.input`
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
  grid-template-columns: 85% 15%;
`;

const MatchAnyAllElement = styled(FilteringPanelGroupElement)`
  grid-template-columns: 50% 50%;
  margin-top: 0.1rem;
  margin-bottom: 0.5rem;
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
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
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
`;

const FilterCreationSaveCancel = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
`;

const FilterDiv = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
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
`;
