import { useState } from "react";
import { styled } from "styled-components";

interface TooltipProps {
  children: JSX.Element;
  text: string;
  style?: Object;
}

export default function Tooltip(props: TooltipProps) {
  const [isTooltipOpen, setIsToolTipOpen] = useState(false);

  return (
    <TooltipWrapper
      onMouseEnter={() => setIsToolTipOpen(true)}
      onMouseLeave={() => setIsToolTipOpen(false)}
    >
      {props.children}
      <TooltipText
        style={
          isTooltipOpen
            ? { visibility: "visible", opacity: 1, ...props.style }
            : { visibility: "hidden", opacity: 1, ...props.style }
        }
      >
        {props.text}
      </TooltipText>
    </TooltipWrapper>
  );
}

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
const TooltipText = styled.div`
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  opacity: 0.5;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: -8%;
  right: 140%;
  margin-left: -60px;
  &::after {
    opacity: 0.5;
    content: "";
    position: absolute;
    top: 40%;
    left: 106%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #4f4f4fb5 transparent transparent transparent;
    transform: rotate(-90deg);
  }
`;
