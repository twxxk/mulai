import { ChangeEventHandler } from "react"
import { modelList } from "../lib/common"

export default function ModelSelector({selectedValue, onChange: handleChange}:{selectedValue:string,  onChange:ChangeEventHandler<HTMLSelectElement>}) {
    // console.log('modelselector is initialized with', selectedValue)

    return (<div className="whitespace-nowrap overflow-hidden">
        Model: <select value={selectedValue} onChange={handleChange} className="font-bold">
            {modelList.map((value) => (
                <option key={value.label} value={value.model}>{value.label}</option>
            ))}
        </select>
    </div>)
}