import { DEFAULT_MODEL, ModelValue, allModelValues } from "./ai-model";

export const characterValues = ['', 'child', 'bullets', 'steps', 'proofreading', 'optimist', 'pessimist', 'melchior', 'balthasar', 'caspar'] as const;
export type CharacterValue = typeof characterValues[number];
export const DEFAULT_CHARACTER_VALUE:CharacterValue = ''

export type Character = {
    value: CharacterValue,
    label: string,
    label_ja: string,
    promptContent: string,
    promptContent_ja: string,
    assistantPromptContent?: string,
    assistantPromptContent_ja?: string,
}

export function validateModelCharacter(modelValueString:string, characterValueString:string):ModelCharacterPair {
    let modelValue = modelValueString as ModelValue 
    let characterValue = characterValueString as CharacterValue
    if (!allModelValues.includes(modelValue)) {
        console.log('model not found:', modelValue, ' defaulting to ', DEFAULT_MODEL.modelValue)
        modelValue = DEFAULT_MODEL.modelValue
    }
    if (!characterValues.includes(characterValue)) {
        console.log('character not found:', characterValue, ' defaulting to ', DEFAULT_CHARACTER_VALUE)
        characterValue = DEFAULT_CHARACTER_VALUE
    }
    return {modelValue, characterValue}
}

export type ModelCharacterPair = {modelValue:ModelValue, characterValue:CharacterValue}
