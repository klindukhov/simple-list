import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  background: "lightgrey",
  panel: "aliceblue",
  text: "black",
};

export const darkTheme = {
  background: "#33373d",
  panel: "#1c1e20",
  text: "#edeef2",
};

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }
  `;
