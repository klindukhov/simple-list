import "remirror/styles/all.css";

import { AllStyledComponent } from "@remirror/styles/styled-components";

import {
  BoldExtension,
  BulletListExtension,
  ItalicExtension,
  OrderedListExtension,
  StrikeExtension,
  TaskListExtension,
  UnderlineExtension,
  TableExtension,
  ImageExtension,
  LinkExtension,
  HeadingExtension,
  CodeBlockExtension,
  MarkdownExtension,
} from "remirror/extensions";
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useHelpers,
  useRemirror,
} from "@remirror/react";
import { useCommands, useActive } from "@remirror/react";

import { styled } from "styled-components";
import {
  ArrowUUpLeft,
  ArrowUUpRight,
  CheckSquare,
  Code,
  GridFour,
  ListBullets,
  ListNumbers,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";
import { EditorState } from "@remirror/pm/state";
import { useEffect } from "react";

interface MenuProps {
  setState: Function;
}

export const Menu = (props: MenuProps) => {
  const {
    toggleBold,
    focus,
    redo,
    undo,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    toggleBulletList,
    toggleTaskList,
    toggleOrderedList,
    createTable,
    toggleHeading,
    createCodeBlock,
  } = useCommands();
  const active = useActive();
  const { getMarkdown } = useHelpers();

  useEffect(() => {
    props.setState(getMarkdown());
  }, [getMarkdown()]);

  return (
    <MenuDiv>
      <ButtonGroup>
        <MenuButton
          onClick={() => {
            undo();
            focus();
          }}
        >
          <ArrowUUpLeft />
        </MenuButton>
        <MenuButton
          onClick={() => {
            redo();
            focus();
          }}
        >
          <ArrowUUpRight />
        </MenuButton>
      </ButtonGroup>
      <ButtonGroup>
        <MenuButton
          onClick={() => {
            toggleHeading({ level: 1 });
            focus();
          }}
          $active={active.heading({ level: 1 })}
        >
          <TextHOne />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleHeading({ level: 2 });
            focus();
          }}
          $active={active.heading({ level: 2 })}
        >
          <TextHTwo />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleHeading({ level: 3 });
            focus();
          }}
          $active={active.heading({ level: 3 })}
        >
          <TextHThree />
        </MenuButton>
      </ButtonGroup>
      <ButtonGroup>
        <MenuButton
          onClick={() => {
            toggleBold();
            focus();
          }}
          $active={active.bold()}
        >
          <TextB />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleItalic();
            focus();
          }}
          $active={active.italic()}
        >
          <TextItalic />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleUnderline();
            focus();
          }}
          $active={active.underline()}
        >
          <TextUnderline />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleStrike();
            focus();
          }}
          $active={active.strike()}
        >
          <TextStrikethrough />
        </MenuButton>
      </ButtonGroup>
      <ButtonGroup>
        <MenuButton
          onClick={() => {
            toggleBulletList();
            focus();
          }}
          $active={active.bulletList()}
        >
          <ListBullets />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleOrderedList();
            focus();
          }}
          $active={active.orderedList()}
        >
          <ListNumbers />
        </MenuButton>
        <MenuButton
          onClick={() => {
            toggleTaskList();
            focus();
          }}
          $active={active.taskList()}
        >
          <CheckSquare />
        </MenuButton>
        <MenuButton
          onClick={() => {
            createTable();
            focus();
          }}
        >
          <GridFour />
        </MenuButton>
      </ButtonGroup>
      <ButtonGroup>
        <MenuButton
          onClick={() => {
            createCodeBlock({ language: "js" });
            focus();
          }}
          $active={active.codeBlock()}
        >
          <Code />
        </MenuButton>
      </ButtonGroup>
    </MenuDiv>
  );
};

interface RemirrorEditorProps {
  state: EditorState | string;
  setState: Function;
}

export const RemirrorEditor = (props: RemirrorEditorProps) => {
  const { manager, state, setState } = useRemirror({
    extensions: () => [
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new StrikeExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      new TableExtension(),
      new ImageExtension(),
      new LinkExtension({ autoLink: true }),
      new HeadingExtension(),
      new CodeBlockExtension(),
      new MarkdownExtension(),
    ],
    content: props.state,
    stringHandler: "markdown",
  });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror
          manager={manager}
          state={state}
          onChange={(e) => {
            setState(e.state);
          }}
        >
          <Menu setState={props.setState} />
          <EditorComponentWrapper>
            <EditorComponent />
          </EditorComponentWrapper>
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

const EditorComponentWrapper = styled.div`
  background-color: ${(props) => props.theme.background};
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  & > div.remirror-editor-wrapper {
    padding-top: 0px;
  }
  & > div.remirror-editor-wrapper > div {
    box-shadow: none !important;
    & > h1,
    h2,
    h3 {
      color: ${(props) => props.theme.text};
    }
  }
`;

const MenuDiv = styled.div`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  box-sizing: border-box;
  padding: 0rem 0.5rem 0rem 0.5rem;
  background-color: ${(props) => props.theme.background};
  border-bottom-width: 3px;
  border-bottom-style: solid;
  border-bottom-color: ${(props) => props.theme.panel};
  width: 100%;
  height: 3rem;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: scroll;
  overflow-y: hidden;
  margin-bottom: 0.1rem;
`;

const MenuButton = styled.button<{ $active?: boolean }>`
  height: 2rem;
  box-sizing: border-box;
  width: 2rem;
  background-color: ${(props) =>
    props.$active ? props.theme.background : props.theme.panel};
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.panel};
  outline: none;
  margin-right: 2px;
  &:hover {
    background-color: ${(props) => props.theme.panel};
    opacity: 0.7;
  }
  &:first-child {
    border-radius: 0.2rem 0rem 0rem 0.2rem;
  }
  &:last-child {
    border-radius: 0rem 0.2rem 0.2rem 0rem;
    margin-right: 0px;
  }
  cursor: pointer;
`;

const ButtonGroup = styled.span`
  padding-right: 0.5rem;
  margin-left: 0.5rem;
  border-right: solid 2px ${(props) => props.theme.panel};
  &:first-child {
    margin-left: 0rem;
  }
  &:last-child {
    border-right: none;
  }
  display: flex;
  flex-wrap: nowrap;
`;
