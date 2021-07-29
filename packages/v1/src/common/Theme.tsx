import React, { useEffect, useState } from "react";
import { Classes, Button } from "@blueprintjs/core";

const KEY_THEME = "theme";
export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}
export const getTheme = () =>
  localStorage.getItem(KEY_THEME) === Theme.DARK.toString()
    ? Theme.DARK
    : Theme.LIGHT;

export const useThemeUpdate = (theme: Theme) => {
  useEffect(() => {
    document.body.classList.toggle(Classes.DARK, theme === Theme.DARK);
    localStorage.setItem(KEY_THEME, theme.toString());
  }, [theme]);
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(getTheme);
  useThemeUpdate(theme);

  const toggleDarkMode = () => {
    setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };
  return (
    <Button
      icon="moon"
      className={Classes.MINIMAL}
      onClick={toggleDarkMode}
      title="Toggle Dark Mode"
    />
  );
}
