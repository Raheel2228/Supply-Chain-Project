import styled from "styled-components";
import { palette } from "../../assets/theme/palette";

export const HeaderWrapper = styled.section`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 3rem;
`;

export const PageTitle = styled.section`
  font-size: 2rem;
  color: ${palette.black80};
`;

export const ActionItems = styled.section`
  padding: 10px;

  & > button {
    margin-right: 10px;
  }
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  border-bottom: 1px solid ${palette.black20};
  padding-bottom: 0.5rem;
`;

export const FilterBar = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  flex: 1;

  & > div {
    margin-right: 10px;
  }

  & .ant-select-item-option-content {
    font-family: "Poppins", sans-serif !important;
  }
`;
