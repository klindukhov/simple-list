import { createGlobalStyle } from "styled-components";

export const lightTheme = {
  background: "rgb(237,238,242)",
  background07: "rgba(237,238,242, 0.7)",
  background05: "rgba(237,238,242, 0.5)",
  panel: "rgb(211,211,211)",
  panel07: "rgba(211,211,211, 0.7)",
  panel05: "rgba(211,211,211, 0.5)",
  text: "black",
};

export const darkTheme = {
  background: "rgb(51,55,61)",
  background07: "rgba(51,55,61,0.7)",
  background05: "rgba(51,55,61,0.5)",
  panel: "rgb(28,30,32)",
  panel07: "rgba(28,30,32,0.7)",
  panel05: "rgba(28,30,32,0.5)",
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
