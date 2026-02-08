import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const Bubble = styled.div`
  background: ${({ theme }) => theme.colors.orange};
  color: #ffffff;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 3px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
  font-size: 14px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Wordmark = styled.span`
  font-size: 32px;
  font-weight: 800;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const Logo = () => (
  <Wrapper>
    <Wordmark>MultiChat</Wordmark>
    <Bubble>Hello</Bubble>
  </Wrapper>
);
