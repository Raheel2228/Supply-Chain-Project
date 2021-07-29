import styled from "styled-components";
import { palette } from "../../assets/theme/palette";

export const HeaderWrapper = styled.aside`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 1.7rem;
  background: #fafafa;
`;

export const Timeline = styled.div`
  display: flex;
`;

export const TimeLineItem = styled.div<{ locked?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 32px;
  padding: 5px 15px;
  border: 1px solid ${palette.grape};
  background: ${(props) => (props.locked ? palette.grape : "transparent")};

  & p {
    margin: 0px;
    color: ${(props) => (props.locked ? palette.white : palette.grape)};
  }
`;

export const TimeLineArrow = styled.div<{ locked?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.locked ? palette.grape : palette.black20)};
  padding: 5px;
`;

export const SOPSelection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-right: 2rem;
  border: 1px solid #eee;
`;

export const Label = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 10px;
  color: ${palette.black80};
  background: #e5e5e5;
`;

export const UserControl = styled.div`
  display: flex;
`;
