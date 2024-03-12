'use client';

import { createContext } from "react";

export const LocaleContext = createContext("en")

export function LocaleProvider({ children, locale }:{ children: React.ReactNode, locale: string }) {
	return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}
