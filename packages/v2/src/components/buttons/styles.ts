import styled from "styled-components";
import { Button } from "antd";

import { palette } from "../../assets/theme/palette";

export const RoundedButton = styled(Button)<{ color?: string }>`
  border-radius: 3px;
  border-color: ${props => props.color  ? props.color : palette.blue} !important;
  color: ${props => props.color  ? props.color : palette.blue} !important;

  &:hover{
    background: ${props => props.color  ? props.color : palette.blue} !important;
    color: ${palette.white}!important;
  }
  
`;
