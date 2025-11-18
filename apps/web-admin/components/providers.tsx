"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  // const appLanguage = localStorage ? localStorage.getItem("app-language") ?? "en" : 'en';
  const [local, setLocal] = React.useState("en");
  const [staff, setStaff] = React.useState({});

  // React.useEffect(() => {
  //   if (appLanguage) {
  //     setLocal(appLanguage ?? "en");
  //   }
  // }, [appLanguage]);

  React.useEffect(() => {
    if (window !== undefined) {
      const webElement = document.getElementById('web');
      if (webElement) {
        if (local === "en") {
          webElement.classList.add("web-class");
        } else {
          webElement.classList.remove("web-class");
        }
      }
    }
  }, [local]);

  return <div className="w-full">{children}</div>
}
