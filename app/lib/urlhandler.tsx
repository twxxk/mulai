import { ReadonlyURLSearchParams } from "next/navigation"
import { ModelCharacterPair, validateModelCharacter } from "./model-character"

// for debug
const freeValues:ModelCharacterPair[] = [
    {modelValue: 'gemini-1.0-pro', characterValue: ''},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
    {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  ]
  // for production
  const defaultModelValues:ModelCharacterPair[] = [
    {modelValue: 'gemini-2.0-flash', characterValue: ''},
    {modelValue: 'gpt-4.1', characterValue: ''},
    {modelValue: 'claude-3.5-sonnet', characterValue: ''},
    {modelValue: 'command-r-plus-08-2024', characterValue: ''},
  ]
  // for debug purpose
  // const allValues:ModelCharacterPair[] = [
  //   {modelValue: 'gpt-3.5-turbo', characterValue: ''},
  //   {modelValue: 'gemini-1.0-pro-latest', characterValue: ''},
  //   {modelValue: 'gemini-1.0-pro', characterValue: ''},
  //   {modelValue: 'firellava-13b', characterValue: ''},
  //   {modelValue: 'qwen-14b-chat', characterValue: ''},
  //   {modelValue: 'qwen-72b-chat', characterValue: ''},
  //   {modelValue: 'llama-v2-7b-chat', characterValue: ''},
  //   {modelValue: 'llama-v2-13b-chat', characterValue: ''},
  //   {modelValue: 'llama-v2-70b-chat', characterValue: ''},
  // ]
  
  const specialPairs:{[key:string]:ModelCharacterPair[]} = {
    default: (
        // process.env.NODE_ENV === 'development' ? freeValues : 
        defaultModelValues),
    inference: [
        {modelValue: 'o4-mini', characterValue: ''},
        {modelValue: 'deepseek-v3', characterValue: ''},
        {modelValue: 'deepseek-r1', characterValue: ''},
        {modelValue: 'sonar-reasoning-pro', characterValue: ''},
    ],
    ej: [
        {modelValue: 'qwen-72b-chat', characterValue: 'ej'},
        {modelValue: 'llama-3-sonar-large-chat', characterValue: 'ej'},
        {modelValue: 'groq-llama3-70b-8192', characterValue: 'ej'},
    ],
    magi: [
        {modelValue: 'gemini-1.0-pro-latest', characterValue: 'melchior'},
        {modelValue: 'gemini-1.0-pro-latest', characterValue: 'balthasar'},
        {modelValue: 'gemini-1.0-pro-latest', characterValue: 'caspar'},
    ],
    optpess: [
        {modelValue: 'gemini-1.0-pro-latest', characterValue: 'optimist'},
        {modelValue: 'gemini-1.0-pro-latest', characterValue: 'pessimist'},
    ],
    gpt: [
        {modelValue: 'gpt-4.1', characterValue: ''},
        {modelValue: 'gpt-4o', characterValue: ''},
        {modelValue: 'o3-mini', characterValue: ''},
    ],
    google: [
        {modelValue: 'gemini-2.5-pro', characterValue: ''},
        {modelValue: 'gemini-2.5-flash', characterValue: ''},
        {modelValue: 'gemini-2.0-flash', characterValue: ''},
    ],
    describeimage: [
        {modelValue: 'gpt-4o', characterValue: ''},
    ],
    generateimage: [
        {modelValue: 'stable-diffusion-2', characterValue: ''},
        {modelValue: 'dall-e-2', characterValue: ''},
        {modelValue: 'dall-e-3', characterValue: ''},
    ],
  }
  
export function getModelCharacterValues(modelsParam: string): ModelCharacterPair[] {
    // console.log('param:', modelsParam)
    // for debug
    // if (modelsParam === '') 
    //   return allValues.slice(10, 10+3)

    // default, no params
    if (modelsParam === '') {
        return specialPairs.default
    }

    // Evangelion
    if (modelsParam === 'ej') {
        return specialPairs.ej
    }
    if (modelsParam === 'magi') {
        return specialPairs.magi
    }
    if (modelsParam === 'optpess') {
        return specialPairs.optpess
    }
    if (modelsParam === 'describeimage') {
        return specialPairs.describeimage
    }
    if (modelsParam === 'generateimage') {
        return specialPairs.generateimage
    }
    if (modelsParam === 'google') {
        return specialPairs.google
    }
    if (modelsParam === 'gpt') {
        return specialPairs.gpt
    }
    if (modelsParam === 'anthropic') {
        return specialPairs.anthropic
    }
    if (modelsParam == 'inference') {
        return specialPairs.inference
    }

    // 1..5. Only shorthand to longhand. No generate this url.
    const modelsNumber = parseInt(modelsParam ?? '0')
    if (modelsNumber >= 1 && modelsNumber <= 5)
        return defaultModelValues.slice(0, modelsNumber)

    // model1(:character1),model2(:character2),...
    // wrong values might be passed
    return modelsParam.split(',').map((value, index) => {
        const [modelValueString, characterValueString] = value.split(':')
        return validateModelCharacter(modelValueString, characterValueString ?? '') // undefined => ''
    })
}

// generate /?models={return} from the current models and characters
export function generateModelsParam(modelCharacters: ModelCharacterPair[]): string {
    // console.log('now', modelCharacters)
    const matched = Object.entries(specialPairs).find(([key, pairs]) => {
        // console.log(key, 'pairs', pairs)
        if (pairs.length != modelCharacters.length) return false;
        return pairs.every((lhsPair, index) => {
            const rhsPair = modelCharacters.at(index) as ModelCharacterPair
            if (!rhsPair) return false
            return lhsPair.modelValue === rhsPair.modelValue && (lhsPair.characterValue ?? '') === (rhsPair.characterValue ?? '')
        })
    })
    // console.log(matched)
    if (matched) {
        const key = matched[0]
        if (key === 'default') return ''
        return key
    }

    let a: string[] = []
    modelCharacters.map((modelCharacter) => {
        // console.log('character:', modelCharacter.characterValue)
        const mc = modelCharacter.modelValue + (modelCharacter.characterValue ? ':' + modelCharacter.characterValue : '')
        a.push(mc)
    })
    return a.join(',')
}

export function generateUrlToReplace(searchParams: ReadonlyURLSearchParams, modelCharacterValues: ModelCharacterPair[]): string {
    const paramString: string = generateModelsParam(modelCharacterValues)

    let newSearchParams: string[][] = []
    searchParams.forEach((value, key) => {
        // delete
        if (key === 'models' && paramString === '')
            return;
        // update
        newSearchParams.push([key, key === 'models' ? paramString : value])
    })

    // add
    if (!searchParams.has('models') && paramString !== '')
        newSearchParams.push(['models', paramString])

    const newSearchString = newSearchParams
        .map(([key, value]: string[]) => key + '=' + value)
        .join('&')
    // console.log('model or character is updated. generated a new url:', paramString, 'new:', newSearchString)

    if (newSearchString.length > 0)
        return '/?' + newSearchString
    else
        return '/'
}