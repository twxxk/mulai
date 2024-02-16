'use client'

import { DicesIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

const candidateModels = ['magi', 'optpess']

function generateRandomUrl(modelsParam:string) {

    let models = candidateModels.slice()
    const pos = candidateModels.indexOf(modelsParam)
    if (pos >= 0)
        models.splice(pos, 1)
    
    const index = Math.floor(Math.random() * models.length)
    return '/?models=' + models[index]
}

export default function DiceLink({className}:{className:string}) {
    const searchParams = useSearchParams()
    const modelsParam = searchParams.get('models')
    const randomUrl = generateRandomUrl(modelsParam ?? '')

    return (<a href={randomUrl}><button className={className}>
        <DicesIcon />
    </button></a>)
}
