'use client'

import { DicesIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { modelValues, characterValues } from "../lib/common";

// false means true random
const candidateModelKeywords = ['magi', 'optpess', false, false]

// magi, optpess, or true random
function generateRandomUrl(modelsParam:string) {
    // exclude current URL
    let keywords = candidateModelKeywords.slice()
    const pos = candidateModelKeywords.indexOf(modelsParam)
    if (pos >= 0)
        keywords.splice(pos, 1)
    
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    if (keyword)
        return '/?models=' + keyword

    // true random
    const pane = 3
    const a = Array(pane).fill('').map(() => {
        const model = modelValues[Math.floor(Math.random() * modelValues.length)]
        const character = characterValues[Math.floor(Math.random() * characterValues.length)]
        const s = model + (character ? ':' + character : '')
        // console.log(s)
        return s
    })
    return '/?models=' + a.join(',')
}

export default function DiceLink({className}:{className:string}) {
    const searchParams = useSearchParams()
    const modelsParam = searchParams.get('models')
    const randomUrl = generateRandomUrl(modelsParam ?? '')

    return (<a href={randomUrl} suppressHydrationWarning={true}><button className={className}>
        <DicesIcon />
    </button></a>)
}
