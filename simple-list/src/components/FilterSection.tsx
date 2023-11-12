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

  return (
    <>
      <input
        type='file'
        style={{ position: "absolute", zIndex: "-200", visibility: "hidden" }}
        id='importFileInput'
        onChange={(e) => handleFileUpload(e)}
        accept='.json'
      ></input>
      <FilteringSidePanel>
        <span>
          <span style={{ height: "0px" }}></span>
          <FilteringElement
            style={{
              gridTemplateColumns: "auto auto auto",
              backgroundColor: "transparent",
            }}
          >
            <SortDirectionButton
              onClick={() =>
                props.setTheme(props.theme === "dark" ? "light" : "dark")
              }
            >
              <img
                src={props.theme === "dark" ? SunWhite : SunBlack}
                style={{
                  height: "1rem",
                  display: "grid",
                  alignSelf: "center",
                  cursor: "pointer",
                }}
              />
            </SortDirectionButton>
            <ImportExportButton onClick={exportList}>
              {"Export  "}
              <img
                src={props.theme === "dark" ? ExportWhite : ExportBlack}
                style={{ height: "1rem" }}
              />
            </ImportExportButton>
            <ImportExportButton
              onClick={() =>
                document.getElementById("importFileInput")?.click()
              }
            >
              Import
              <img
                src={props.theme === "dark" ? ImportWhite : ImportBlack}
                style={{ height: "1rem" }}
              />
            </ImportExportButton>
          </FilteringElement>
        </span>
        <span>
          <FilteringElement
            style={{
              gridTemplateColumns: "15% 85%",
              backgroundColor: "transparent",
            }}
          >
            <img
              src={props.theme === "dark" ? SearchIconWhite : SearchIconBlack}
              style={{ height: "1.5rem" }}
            />
            <SearchBarInput
              onChange={(e) => props.setSearchBarValue(e.target.value)}
            ></SearchBarInput>
          </FilteringElement>
          <FilteringElement
            style={{
              gridTemplateColumns: "25% 60% 15%",
              backgroundColor: "transparent",
            }}
          >
            <div>Sort by:</div>
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
              <SortDirectionButton>
                <img
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
                  style={{
                    height: "0.8rem",
                    display: "grid",
                    alignSelf: "center",
                    cursor: "pointer",
                  }}
                />
              </SortDirectionButton>
            </Tooltip>
          </FilteringElement>
          <FilteringElement
            style={{
              gridTemplateColumns: "80% 20%",
              backgroundColor: "transparent",
            }}
          >
            <div>
              {"Filters Used: "}
              {getNumberOfFiltersUsed()}
            </div>
            <Tooltip
              text={
                props.isShowingCompleted ? "Hide completed" : "Show completed"
              }
            >
              <FilteringElementSectionShowingCompleted
                style={
                  props.isShowingCompleted
                    ? {}
                    : { backgroundColor: "transparent" }
                }
                onClick={() =>
                  props.setIsShowingCompleted(!props.isShowingCompleted)
                }
              >
                <img
                  src={
                    props.theme === "dark"
                      ? CheckedCheckmarkWhite
                      : CheckedCheckmarkBlack
                  }
                  style={{ height: "2rem" }}
                />
              </FilteringElementSectionShowingCompleted>
            </Tooltip>
          </FilteringElement>
          <FilteringElement
            style={{
              gridTemplateColumns: "50% 50%",
              backgroundColor: "transparent",
            }}
          >
            <FilteringElementSection
              style={
                props.isFilteringMatchAny
                  ? { backgroundColor: "transparent" }
                  : {}
              }
              onClick={() => props.setIsFilteringMatchAny(false)}
            >
              <span
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto",
                  columnGap: "1rem",
                  alignItems: "center",
                }}
              >
                <div>{"Match all"}</div>
                <img
                  src={props.theme === "dark" ? MatchAllWhite : MatchAllBlack}
                  style={{ height: "1.5rem" }}
                />
              </span>
            </FilteringElementSection>
            <FilteringElementSection
              style={
                !props.isFilteringMatchAny
                  ? { backgroundColor: "transparent" }
                  : {}
              }
              onClick={() => props.setIsFilteringMatchAny(true)}
            >
              <span
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto",
                  columnGap: "1rem",
                  alignItems: "center",
                }}
              >
                <div>{"Match any"}</div>
                <img
                  src={props.theme === "dark" ? MatchAnyWhite : MatchAnyBlack}
                  style={{ height: "1.5rem" }}
                />
              </span>
            </FilteringElementSection>
          </FilteringElement>
        </span>
        <span>
          {getFiltersList().map((tag) => (
            <FilteringElement
              key={tag}
              style={
                (tag[0] === "$" &&
                  Object.keys(props.tagsList)
                    .filter((e) => e.includes(tag))
                    .some((e) => props.tagsList[e])) ||
                props.tagsList[tag]
                  ? { cursor: "pointer" }
                  : { backgroundColor: "transparent", cursor: "pointer" }
              }
              onClick={() => highlightTag(tag)}
            >
              {tag[0] === "$" ? "Have " + tag.slice(1) : tag}
            </FilteringElement>
          ))}
        </span>
      </FilteringSidePanel>
    </>
  );
}

const FilteringElement = styled.div`
  background-color: ${(props) => props.theme.background};
  border-width: 2px;
  border-style: solid;
  border-color: ${(props) => props.theme.background};
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

const SortDirectionButton = styled.button`
  background-color: ${(props) => props.theme.background};
  color: inherit;
  outline: none;
  border-radius: 0.5rem;
  border-width: 0px;
  width: 2rem;
  height: 2rem;
  box-sizing: border-box;
  padding: 0.5rem;
  margin: 0.5rem;
  justify-self: center;
`;

const ImportExportButton = styled(SortDirectionButton)`
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
  justify-items: center;
  width: 10rem;
  margin: 0rem;
  cursor: pointer;
  background-color: ${(props) => props.theme.background};
`;

const FilteringElementSectionShowingCompleted = styled(FilteringElementSection)`
  width: 4rem;
  background-color: ${(props) => props.theme.background};
  border-left: ${(props) => props.theme.background} solid 2px;
  border-radius: 0rem 0.4rem 0rem 0rem;
`;
