import { ChangeEventHandler } from "react"
import { selectableModels, allModels, ChatModelData } from "../lib/common"

export default function ModelSelector({selectedValue, onChange: handleChange}:{selectedValue:string,  onChange:ChangeEventHandler<HTMLSelectElement>}) {
    // console.log('modelselector is initialized with', selectedValue)

    // show non selectable option only if it is specified with the parameter
    const isModelSelectable = selectableModels.find((value) => value.modelValue === selectedValue)
    const modelData = allModels.find((value) => value.modelValue === selectedValue)

    return (<div className="whitespace-nowrap overflow-hidden">
        Model: <select value={selectedValue} onChange={handleChange} className="font-bold">
            {isModelSelectable && modelData ? '' : (<option key={modelData?.label} value={modelData?.modelValue}>{modelData?.label}</option>)}
            {selectableModels.map((value) => (
                <option key={value.label} value={value.modelValue}>{value.label}</option>
            ))}
        </select>
    </div>)
}