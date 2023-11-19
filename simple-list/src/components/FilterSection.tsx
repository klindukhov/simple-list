import { styled } from "styled-components";
import SearchIconBlack from "../assets/SearchBlack.png";
import SearchIconWhite from "../assets/SearchWhite.png";
import Tooltip from "./ui/Tooltip";
import SortAsc from "../assets/SortAsc.png";
import SortDesc from "../assets/SortDesc.png";
import CheckedCheckmarkBlack from "../assets/CheckedCheckmarkBlack.png";
import CheckedCheckmarkWhite from "../assets/CheckedCheckmarkWhite.png";
import MatchAnyBlack from "../assets/MatchAnyBlack.png";
import MatchAnyWhite from "../assets/MatchAnyWhite.png";
import MatchAllBlack from "../assets/MatchAllBlack.png";
import MatchAllWhite from "../assets/MatchAllWhite.png";
import SunWhite from "../assets/SunWhite.png";
import SunBlack from "../assets/SunBlack.png";
import SortAscWhite from "../assets/SortAscWhite.png";
import SortDescWhite from "../assets/SortDescWhite.png";
import ExportWhite from "../assets/ExportWhite.png";
import ImportWhite from "../assets/ImportWhite.png";
import ExportBlack from "../assets/ExportBlack.png";
import ImportBlack from "../assets/ImportBlack.png";
import { ListItem } from "../App";

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
            <SquareButtonImage
              src={props.theme === "dark" ? SunWhite : SunBlack}
            />
          </SquareButton>
          <ImportExportButton onClick={exportList}>
            {"Export  "}
            <SquareButtonImage
              src={props.theme === "dark" ? ExportWhite : ExportBlack}
            />
          </ImportExportButton>
          <ImportExportButton
            onClick={() => document.getElementById("importFileInput")?.click()}
          >
            Import
            <SquareButtonImage
              src={props.theme === "dark" ? ImportWhite : ImportBlack}
            />
          </ImportExportButton>
        </ExportImportPanel>
        <span>
          <FilteringPanelControls15_85>
            <Img1_5rem
              src={props.theme === "dark" ? SearchIconWhite : SearchIconBlack}
            />
            <SearchBarInput
              onChange={(e) => props.setSearchBarValue(e.target.value)}
            />
          </FilteringPanelControls15_85>
          <FilteringPanelControls25_60_15>
            Sort by:
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
            <Tooltip
              text={props.isSortAsc ? "Acsending" : "Descending"}
              style={{ left: "85%" }}
            >
              <SquareButton>
                <SquareButtonImage
                  src={
                    props.isSortAsc
                      ? props.theme === "dark"
                        ? SortAscWhite
                        : SortAsc
                      : props.theme === "dark"
                      ? SortDescWhite
                      : SortDesc
                  }
                  onClick={() => props.setIsSortAcs(!props.isSortAsc)}
                />
              </SquareButton>
            </Tooltip>
          </FilteringPanelControls25_60_15>
          <FilteringPanelControls80_20>
            {"Filters Used: "}
            {getNumberOfFiltersUsed()}
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
                <Img2rem
                  src={
                    props.theme === "dark"
                      ? CheckedCheckmarkWhite
                      : CheckedCheckmarkBlack
                  }
                />
              </FilteringPanelControlsShowCompleted>
            </Tooltip>
          </FilteringPanelControls80_20>
          <FilteringPanelControls50_50>
            <FilteringMatch
              $isFilteringMatchAny={props.isFilteringMatchAny}
              onClick={() => props.setIsFilteringMatchAny(false)}
            >
              Match all
              <Img1_5rem
                src={props.theme === "dark" ? MatchAllWhite : MatchAllBlack}
              />
            </FilteringMatch>
            <FilteringMatch
              $isFilteringMatchAny={props.isFilteringMatchAny}
              onClick={() => props.setIsFilteringMatchAny(true)}
            >
              Match any
              <Img1_5rem
                src={props.theme === "dark" ? MatchAnyWhite : MatchAnyBlack}
              />
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
                {tag[0] === "$" ? "Have " + tag.slice(1) : tag}
              </FilteringPanelFilter>
            ))}
        </span>
      </FilteringSidePanel>
    </>
  );
}

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
`;

const SquareButtonImage = styled.img`
  height: 1rem;
  display: grid;
  justify-self: center;
  align-self: center;
  cursor: pointer;
`;

const Img1_5rem = styled.img`
  height: 1.5rem;
`;

const Img2rem = styled.img`
  height: 2rem;
`;

const ImportExportButton = styled(SquareButton)`
  width: 6rem;
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  cursor: pointer;
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
`;
