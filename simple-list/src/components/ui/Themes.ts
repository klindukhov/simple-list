import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  background: "lightgrey",
  panel: "aliceblue",
  text: "black",
};

export const darkTheme = {
  background: "#4f4f4f",
  panel: "#363636",
  text: "aliceblue",
};

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }
  `;
