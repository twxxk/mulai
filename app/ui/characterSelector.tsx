import { ChangeEventHandler, useContext } from "react"
import { Character } from "../lib/common"
import { LocaleContext, getTranslations } from "../lib/LocaleContext"

export default function CharacterSelector({selectedValue, characters, onChange: handleChange}:{selectedValue:string, characters:any[], onChange:ChangeEventHandler<HTMLSelectElement>}) {
	const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)

    if (characters.length < 1) return ''

    return (<span className="whitespace-nowrap overflow-hidden">
            {t('character')} <select value={selectedValue} onChange={handleChange} className="font-bold">
            {characters.map((c:Character, index:number) => (
                <option key={index} value={c.value}>{locale == 'ja' ? c.label_ja : c.label}</option>
            ))}
        </select>
    </span>)
}