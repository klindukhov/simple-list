import { styled } from "styled-components";
import Tooltip from "./ui/Tooltip";
import { ListItem } from "../App";
import {
  DownloadSimple,
  Eye,
  EyeSlash,
  Intersect,
  MagnifyingGlass,
  Moon,
  SortAscending,
  SortDescending,
  Sun,
  Unite,
  UploadSimple,
} from "@phosphor-icons/react";

interface FilterSectionProps {
  list: { [itemId: string]: ListItem };
  setList: Function;
  searchBarValue: string;
  setSearchBarValue: Function;
  sortByList: { [tag: string]: boolean };
  setSortByList: Function;
  isSortAsc: boolean;
  setIsSortAcs: Function;
  tagsList: { [tag: string]: boolean };
  setTagsList: Function;
  isShowingCompleted: boolean;
  setIsShowingCompleted: Function;
  isFilteringMatchAny: boolean;
  setIsFilteringMatchAny: Function;
  theme: string;
  setTheme: Function;
}

export default function FilterSection(props: FilterSectionProps) {
  const handleSortBySelectChange = (selectedTag: string) => {
    let tempSortByList: { [tag: string]: boolean } = {};
    Object.assign(tempSortByList, props.sortByList);
    for (const tag in tempSortByList) {
      tempSortByList[tag as keyof typeof tempSortByList] = tag === selectedTag;
    }
    props.setSortByList(tempSortByList);
  };

  const getNumberOfFiltersUsed = () => {
    return Array.from(
      new Set(
        Object.keys(props.tagsList)
          .filter((tag) => props.tagsList[tag])
          .map((e) => (e[0] === "$" ? e.split("=")[0] : e))
      )
    ).length;
  };

  const getFiltersList = () => {
    return Array.from(
      new Set(
        Object.keys(props.tagsList)
          .filter((tag) => tag !== "Completed" && !tag.includes(`$Created=`))
          .map((e) => (e[0] === "$" ? e.split("=")[0] : e))
      )
    );
  };

  const highlightTag = (tag: string) => {
    let tempTagsList: { [tag: string]: boolean } = {};
    Object.assign(tempTagsList, props.tagsList);

    if (tag[0] === "$") {
      for (let t in tempTagsList) {
        tempTagsList[t] = t.includes(tag) ? !tempTagsList[t] : tempTagsList[t];
      }
    } else {
      tempTagsList[tag] = !tempTagsList[tag];
    }

    props.setTagsList(tempTagsList);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files) return;
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      let imported: { [itemId: string]: ListItem } = JSON.parse(
        "" + e.target?.result
      );
      let tempList: { [itemId: string]: ListItem } = {};
      Object.assign(tempList, props.list);
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

  const getIsTagHighlighted = (tag: string) => {
    return (
      (tag[0] === "$" &&
        Object.keys(props.tagsList)
          .filter((e) => e.includes(tag))
          .some((e) => props.tagsList[e])) ||
      props.tagsList[tag]
    );
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
          <ImportExportButton onClick={exportList}>
            {"Export  "}
            <UploadSimple />
          </ImportExportButton>
          <ImportExportButton
            onClick={() => document.getElementById("importFileInput")?.click()}
          >
            Import
            <DownloadSimple />
          </ImportExportButton>
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
          <SortBySelect
            onChange={(e) => handleSortBySelectChange(e.target.value)}
          >
            {props.sortByList &&
              Object.keys(props.sortByList).map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
          </SortBySelect>
          <SquareButtonEnd onClick={() => props.setIsSortAcs(!props.isSortAsc)}>
            {props.isSortAsc && <SortAscending size={"1.5rem"} />}
            {!props.isSortAsc && <SortDescending size={"1.5rem"} />}
          </SquareButtonEnd>
        </SortByElement>
        <FiltersUsedElement>
          <Txt>
            {"Filters Used: "}
            {getNumberOfFiltersUsed()}
          </Txt>
          <SquareButtonEnd
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
          </SquareButtonEnd>
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
        <FilterElementsWrapper>
          {props.tagsList &&
            getFiltersList().map((tag) => (
              <FilteringPanelFilter
                key={tag}
                $isHighlighted={getIsTagHighlighted(tag)}
                onClick={() => highlightTag(tag)}
              >
                <FilteringPanelFilterText>
                  {tag[0] === "$" ? "Have " + tag.slice(1) : tag}
                </FilteringPanelFilterText>
              </FilteringPanelFilter>
            ))}
        </FilterElementsWrapper>
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
  grid-template-columns: auto auto auto;
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
    background-color: ${(props) => props.theme.background};
  }
`;

const ImportExportButton = styled(SquareButton)`
  height: 2rem;
  width: auto;
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background};
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

const SquareButtonEnd = styled(SquareButton)`
  justify-self: end;
`;

const SortBySelect = styled.select`
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
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const FiltersUsedElement = styled(FilteringPanelGroupElement)`
  margin-top: 1rem;
  grid-template-columns: 85% 15%;
  font-size: 0.8rem;
`;

const MatchAnyAllElement = styled(FilteringPanelGroupElement)`
  grid-template-columns: 50% 50%;
  margin-top: 0.1rem;
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
    background-color: ${(props) => props.theme.background};
    opacity: ${(props) => (!props.$isFilteringMatchAny ? "1" : "0.5")};
    border-bottom-left-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
  }
  &:last-child {
    background-color: ${(props) => props.theme.background};
    opacity: ${(props) => (props.$isFilteringMatchAny ? "1" : "0.5")};
    border-bottom-right-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const FilterElementsWrapper = styled.span`
  width: 100%;
  justify-items: center;
  display: grid;
`;

const FilteringPanelFilter = styled(FilteringPanelGroupElement)<{
  $isHighlighted: boolean;
}>`
  background-color: ${(props) => props.theme.background};
  opacity: ${(props) => (props.$isHighlighted ? "1" : "0.5")};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
  border-bottom: 2px solid ${(props) => props.theme.panel};
  box-sizing: border-box;
`;

const FilteringPanelFilterText = styled.span`
  box-sizing: border-box;
  padding-top: 0.1rem;
  display: inline-flex;
  max-width: 15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-self: center;
`;
