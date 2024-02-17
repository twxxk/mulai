import { ChangeEventHandler } from "react"
import { Character } from "../lib/common"

export default function CharacterSelector({selectedValue, characters, onChange: handleChange}:{selectedValue:string, characters:any[], onChange:ChangeEventHandler<HTMLSelectElement>}) {

    if (characters.length < 1) return 'Character: Normal'

    return (<div className="whitespace-nowrap overflow-hidden">
        Character: <select value={selectedValue} onChange={handleChange} className="font-bold">
            {characters.map((c:Character, index:number) => (
                <option key={index} value={c.value}>{c.label}</option>
            ))}
        </select>
    </div>)
}