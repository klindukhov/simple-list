import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface AutocompleteInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<Element>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  hintList: string[];
  onHintApply: (hint: string) => void;
}

export default function AutocompleteInput(props: AutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hintList, setHintList] = useState<{ [hint: string]: boolean }>({});

  const [hoveredHint, setHoveredHint] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const optionsDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHintList(Object.fromEntries(props.hintList.map((e) => [e, false])));
  }, [props.hintList]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const highlightIndex = Object.values(hintList).findIndex((e) => e);
    const scrollUnitsPerOption =
      optionsDivRef.current?.scrollHeight &&
      optionsDivRef.current?.scrollHeight / Object.keys(hintList).length;
    const numberOfVisibleOptions =
      optionsDivRef.current &&
      scrollUnitsPerOption &&
      Math.floor(optionsDivRef.current.clientHeight / scrollUnitsPerOption);
    const hintListEntries = Object.entries(hintList);
    if (e.key === "ArrowDown") {
      if (highlightIndex > -1) {
        hintListEntries[highlightIndex][1] = false;
      }
      if (highlightIndex === hintListEntries.length - 1) {
        hintListEntries[0][1] = true;
      } else {
        hintListEntries[highlightIndex + 1][1] = true;
      }

      if (
        numberOfVisibleOptions &&
        highlightIndex + 1 > numberOfVisibleOptions &&
        highlightIndex + 1 !== Object.keys(hintList).length
      ) {
        optionsDivRef.current.scroll({
          top:
            (highlightIndex + 1 - numberOfVisibleOptions) *
            scrollUnitsPerOption,
        });
      }
      if (highlightIndex + 1 === Object.keys(hintList).length) {
        if (optionsDivRef.current !== null) {
          optionsDivRef.current.scroll({ top: 0 });
        }
      }
      setHintList(Object.fromEntries(hintListEntries));
    }

    if (e.key === "ArrowUp") {
      if (highlightIndex > -1) {
        hintListEntries[highlightIndex][1] = false;
      }
      if (highlightIndex <= 0) {
        hintListEntries[hintListEntries.length - 1][1] = true;
      } else {
        hintListEntries[highlightIndex - 1][1] = true;
      }
      setHintList(Object.fromEntries(hintListEntries));

      if (
        numberOfVisibleOptions &&
        Object.keys(hintList).length - (highlightIndex - 1) >
          numberOfVisibleOptions
      ) {
        optionsDivRef.current.scroll({
          top: (highlightIndex - 1) * scrollUnitsPerOption,
        });
      }
      if (highlightIndex <= 0) {
        if (optionsDivRef.current !== null) {
          optionsDivRef.current.scroll({
            top: optionsDivRef.current.scrollHeight,
          });
        }
      }
    }
    if (e.key === "Enter" || e.key === " ") {
      if (highlightIndex === -1) {
        props.onKeyDown(e);
      } else {
        props.onHintApply(props.hintList[highlightIndex]);
      }
    }
  };

  const handleMouseEnter = (hint: string) => {
    setHoveredHint(hint);
  };

  const handleMouseLeave = () => {
    setHoveredHint("");
  };

  const handleBlur = () => {
    if (hoveredHint !== "") {
      props.onHintApply(hoveredHint);
    } else {
      setIsFocused(false);
    }
  };

  return (
    <div tabIndex={0} onBlur={handleBlur}>
      <input
        id={props.id}
        value={props.value}
        onChange={(e) => {
          props.onChange(e);
        }}
        onKeyDown={onKeyDown}
        ref={inputRef}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={(e) => {
          props.onBlur(e);
        }}
      />
      {isFocused && (
        <OptionsDiv
          $top={"" + inputRef.current?.offsetTop}
          $left={"" + inputRef.current?.offsetLeft}
          ref={optionsDivRef}
        >
          {props.hintList &&
            Object.keys(hintList).map((hint) => (
              <Option
                $isHighlighted={hintList[hint]}
                key={hint}
                onClick={() => props.onHintApply(hint)}
                onMouseEnter={() => handleMouseEnter(hint)}
                onMouseLeave={() => handleMouseLeave()}
              >
                {hint}
              </Option>
            ))}
        </OptionsDiv>
      )}
    </div>
  );
}

const OptionsDiv = styled.div<{ $top: string; $left: string }>`
  background-color: ${(props) => props.theme.background};
  border: solid 1px ${(props) => props.theme.panel};
  border-top: 0px;
  position: absolute;
  top: calc(${(props) => props.$top}px + 2rem);
  left: ${(props) => props.$left}px;
  border-radius: 0rem 0rem 0.25rem 0.25rem;
  z-index: 2;
  max-height: 10rem;
  overflow-y: scroll;
`;

const Option = styled.div<{ $isHighlighted: boolean }>`
  border-bottom: solid 1px ${(props) => props.theme.panel};
  &:last-child {
    border-bottom: 0px;
  }
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  &:hover {
    background-color: ${(props) => props.theme.panel};
  }
  ${(props) =>
    props.$isHighlighted && `background-color: ${props.theme.panel};`}
  cursor: pointer;
`;
