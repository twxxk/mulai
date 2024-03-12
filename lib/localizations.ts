import { dictionary } from "@/app/locales/dictionary"

export function getTranslations(locale:string) {
	const t = (key:string) => {
		return dictionary[locale][key]
	};
	return { t };
}
