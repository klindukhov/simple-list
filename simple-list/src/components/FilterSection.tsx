import { styled } from "styled-components";
import Tooltip from "./ui/Tooltip";
import { ListItem } from "../App";
import {
  CheckCircle,
  Circle,
  DownloadSimple,
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
    return (tag[0] === "$" &&
      Object.keys(props.tagsList)
        .filter((e) => e.includes(tag))
        .some((e) => props.tagsList[e])) ||
      props.tagsList[tag]
      ? true
      : false;
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
        <span>
          <FilteringPanelControls15_85>
            <MagnifyingGlass size={"1.5rem"} />
            <SearchBarInput
              onChange={(e) => props.setSearchBarValue(e.target.value)}
            />
          </FilteringPanelControls15_85>
          <FilteringPanelControls25_60_15>
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
            <SquareButton onClick={() => props.setIsSortAcs(!props.isSortAsc)}>
              {props.isSortAsc && <SortAscending />}
              {!props.isSortAsc && <SortDescending />}
            </SquareButton>
          </FilteringPanelControls25_60_15>
          <FilteringPanelControls80_20>
            <Txt>
              {"Filters Used: "}
              {getNumberOfFiltersUsed()}
            </Txt>
            <Tooltip
              text={
                props.isShowingCompleted ? "Hide completed" : "Show completed"
              }
            >
              <FilteringPanelControlsShowCompleted
                $isShowingCompleted={props.isShowingCompleted}
                onClick={() =>
                  props.setIsShowingCompleted(!props.isShowingCompleted)
                }
              >
                {!props.isShowingCompleted && <CheckCircle size={"2rem"} />}
                {props.isShowingCompleted && <Circle size={"2rem"} />}
              </FilteringPanelControlsShowCompleted>
            </Tooltip>
          </FilteringPanelControls80_20>
          <FilteringPanelControls50_50>
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
          </FilteringPanelControls50_50>
        </span>
        <span>
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
        </span>
      </FilteringSidePanel>
    </>
  );
}

const Txt = styled.span`
  cursor: default;
`;

const HiddenInput = styled.input`
  position: absolute;
  z-index: -200;
  visibility: hidden;
`;

const FilteringPanelElement = styled.div`
  border-width: 0px 2px 2px 2px;
  border-style: solid;
  border-color: ${(props) => props.theme.background};
  height: 3rem;
  width: 20rem;
  display: grid;
  align-items: center;
  justify-items: center;
`;

const FilteringPanelGroupElement = styled(FilteringPanelElement)`
  &:first-child {
    border-width: 2px 2px 2px 2px;
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

const FilteringPanelControls15_85 = styled(FilteringPanelGroupElement)`
  grid-template-columns: 15% 85%;
`;

const FilteringPanelControls25_60_15 = styled(FilteringPanelGroupElement)`
  grid-template-columns: 25% 60% 15%;
`;

const FilteringPanelControls80_20 = styled(FilteringPanelGroupElement)`
  grid-template-columns: 80% 20%;
`;

const FilteringPanelControls50_50 = styled(FilteringPanelGroupElement)`
  grid-template-columns: 50% 50%;
`;

const FilteringPanelFilter = styled(FilteringPanelGroupElement)<{
  $isHighlighted: boolean;
}>`
  background-color: ${(props) =>
    props.$isHighlighted ? props.theme.background : "transparent"};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const FilteringPanelFilterText = styled.span`
  display: inline-flex;
  max-width: 15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ExportImportPanel = styled(FilteringPanelElement)`
  grid-template-columns: auto auto auto;
  border-radius: 0rem 0rem 0.5rem 0.5rem;
  margin-bottom: 2rem;
`;

const FilteringSidePanel = styled.div`
  height: 100vh;
  overflow: scroll;
  background-color: ${(props) => props.theme.panel};
  display: grid;
  justify-items: center;
  align-content: start;
`;

const SearchBarInput = styled.input`
  color: inherit;
  background-color: ${(props) => props.theme.background};
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 16rem;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const SortBySelect = styled.select`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 12rem;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const SquareButton = styled.button`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 2rem;
  height: 2rem;
  box-sizing: border-box;
  margin: 0.5rem;
  justify-self: center;
  display: grid;
  justify-content: center;
  align-content: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const ImportExportButton = styled(SquareButton)`
  width: 6rem;
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  justify-content: space-around;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const FilteringElementSection = styled.div`
  border: none;
  height: 3rem;
  display: grid;
  align-items: center;
  justify-content: center;
  width: 10rem;
  margin: 0rem;
  cursor: pointer;
  background-color: ${(props) => props.theme.background};
  grid-template-columns: auto auto;
  column-gap: 1rem;
`;

const FilteringMatch = styled(FilteringElementSection)<{
  $isFilteringMatchAny: boolean;
}>`
  &:first-child {
    background-color: ${(props) =>
      !props.$isFilteringMatchAny ? props.theme.background : "transparent"};
  }
  &:last-child {
    background-color: ${(props) =>
      props.$isFilteringMatchAny ? props.theme.background : "transparent"};
  }
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;

const FilteringPanelControlsShowCompleted = styled(FilteringElementSection)<{
  $isShowingCompleted: boolean;
}>`
  display: grid;
  grid-template-columns: auto;
  justify-items: center;
  width: 4rem;
  background-color: ${(props) =>
    props.$isShowingCompleted ? props.theme.background : "transparent"};
  border-left: ${(props) => props.theme.background} solid 2px;
  &:hover {
    background-color: ${(props) => props.theme.background};
    opacity: 0.7;
  }
`;
