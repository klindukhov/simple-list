import { CaretLeft } from "@phosphor-icons/react";
import { styled } from "styled-components";

export const SquareButton = styled.button`
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

export const CaretLeftRotaiton = styled(CaretLeft)<{ $isRotated: boolean }>`
  transform: rotate(${(props) => (props.$isRotated ? "-90deg" : "0deg")});
  transition-duration: 100ms;
`;
