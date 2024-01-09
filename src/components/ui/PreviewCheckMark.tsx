import { CheckCircle, Circle } from "@phosphor-icons/react";
import { styled } from "styled-components";

interface PreviewCheckmarkProps {
  height: string;
  checked: boolean;
  onClick: () => void;
}

export default function PreviewCheckmark(props: PreviewCheckmarkProps) {
  return (
    <PreviewCheckMark onClick={() => props.onClick()}>
      {props.checked && <CheckCircle size={props.height} />}
      {!props.checked && (
        <>
          <CheckCircleDimmed size={props.height} $Offset={props.height} />
          <Circle size={props.height} />
        </>
      )}
    </PreviewCheckMark>
  );
}

const PreviewCheckMark = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const CheckCircleDimmed = styled(CheckCircle)<{ $Offset: string }>`
  opacity: 0.4;
  position: relative;
  z-index: -1;
  left: ${(props) => props.$Offset};
  margin-left: -${(props) => props.$Offset};
`;
