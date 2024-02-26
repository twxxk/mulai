'use client';

import { dictionary } from "../locales/dictionary";
import { Context, createContext, useContext } from "react";

export let LocaleContext:Context<string> = createContext("en")

export function getTranslations(locale:string) {
	const t = (key:string) => {
		return 	dictionary[locale][key]
	};
	return { t };
}
