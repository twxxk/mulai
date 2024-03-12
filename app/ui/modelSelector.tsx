import { ChangeEventHandler, useContext } from "react"
import { selectableModels, allModels } from "../lib/ai-model"
import { LocaleContext } from "@/lib/client/locale-context"
import { getTranslations } from '@/lib/localizations';

export default function ModelSelector({selectedValue, onChange: handleChange}:{selectedValue:string,  onChange:ChangeEventHandler<HTMLSelectElement>}) {
    // console.log('modelselector is initialized with', selectedValue)

    // show non selectable option only if it is specified with the parameter
    const modelData = allModels.find((value) => value.modelValue === selectedValue)
    const isModelSelectable = modelData 
        ? !!selectableModels.find((value) => value.modelValue === selectedValue)
        : false

    const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)

    return (<span className="whitespace-nowrap overflow-hidden mr-1">
        {t('model')} <select value={selectedValue} onChange={handleChange} className="font-bold">
            {(!isModelSelectable && modelData) &&
                (<option key={modelData!.label} value={modelData!.modelValue}>
                    {modelData!.label}
                </option>)}
            {selectableModels.map((value) => (
                // show non recommended model with weak colors
                <option key={value.label} value={value.modelValue} className={locale == 'ja' 
                    ? (value.japaneseScore >= 50 ? 'text-black' : value.japaneseScore >= 15 ? 'text-gray-400' : 'text-gray-200') 
                    : (value.qualityScore > 50 ? 'text-black' : value.qualityScore >= 40 ? 'text-gray-400' : 'text-gray-200')
                }>
                    {value.label} {/*value.qualityScore*/}
                </option>
            ))}
        </select>
    </span>)
}