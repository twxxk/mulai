import { ChangeEventHandler } from "react"
import { selectableModels, allModels } from "../lib/common"

export default function ModelSelector({selectedValue, onChange: handleChange}:{selectedValue:string,  onChange:ChangeEventHandler<HTMLSelectElement>}) {
    // console.log('modelselector is initialized with', selectedValue)

    // show non selectable option only if it is specified with the parameter
    const modelData = allModels.find((value) => value.modelValue === selectedValue)
    const isModelSelectable = modelData 
        ? !!selectableModels.find((value) => value.modelValue === selectedValue)
        : false

    return (<div className="whitespace-nowrap overflow-hidden">
        Model: <select value={selectedValue} onChange={handleChange} className="font-bold">
            {(!isModelSelectable && modelData) &&
                (<option key={modelData?.label} value={modelData?.modelValue}>
                    {modelData?.label}
                </option>)}
            {selectableModels.map((value) => (
                // show non recommended model with weak colors
                <option key={value.label} value={value.modelValue} 
                    className={value.japaneseScore >= 50 ? 'text-black' 
                        : value.japaneseScore >= 10 ? 'text-gray-400'
                        : 'text-gray-200'}
                >
                    {value.label}
                </option>
            ))}
        </select>
    </div>)
}