'use client';

import { dictionary } from "../locales/dictionary";
import { createContext } from "react";

export const LocaleContext = createContext("en")

export function getTranslations(locale:string) {
	const t = (key:string) => {
		return dictionary[locale][key]
	};
	return { t };
}

export function LocaleProvider({ children, locale }:{ children: React.ReactNode, locale: string }) {
	return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}