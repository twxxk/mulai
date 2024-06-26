'use client';

import Chat, { getCharacter } from './chat'
import { useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { UseChatHelpers } from './chatOptions'
import { SendIcon, StopCircleIcon, Trash2Icon } from 'lucide-react';
import { DEFAULT_MODEL, ModelValue, getModelByValue } from '@/app/lib/ai-model';
import { useRouter } from 'next/navigation';
import EnterableTextarea from './enterableTextarea';
import { generateUrlToReplace, getModelCharacterValues } from '../lib/urlhandler';
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import { LocaleContext } from "@/lib/client/locale-context"
import { getTranslations } from '@/lib/localizations';
import { Character, DEFAULT_CHARACTER_VALUE, ModelCharacterPair } from '../lib/model-character';
import { EventName, eventBus } from '../lib/event-emitter';

// 2 => [50, 50], 4 => [25, 25, 25, 25]
function splitToArray(num:number) {
  return Array(num).fill(100/num)
}

export default function ChatsArea() {
  const searchParams = useSearchParams()
  const modelsParam = searchParams.get('models')
  const [modelCharacterValues, setModelCharacterValues] = useState(getModelCharacterValues(modelsParam ?? ''))
  // console.log('mc', modelCharacterValues)

  const [parentInput, setParentInput] = useState('')
  let splitSizes = splitToArray(modelCharacterValues.length)
  const [imageUrl, setImageUrl] = useState('')

  const hasVisionModel = modelCharacterValues.findIndex(mc => getModelByValue(mc.modelValue)?.doesAcceptImageUrl) >= 0

  const formRef = useRef<HTMLFormElement>(null);
  // const fileImageRef = useRef<HTMLInputElement>(null)
  // const [fileSelected, setFileSelected] = useState(false)
  const [isLoadingAnyChat, setIsLoadingAnyChat] = useState(false)
  const isUsingIME = useRef(false)

  const chats:UseChatHelpers[] = []

  const router = useRouter()
  const urlToReplace = generateUrlToReplace(searchParams, modelCharacterValues)

  const [verticalSizes, setVerticalSizes] = useState([95, 5]);
  const [horizontalSizes, setHorizontalSizes] = useState([] as number[]);

	const locale = useContext(LocaleContext)
  const {t} = getTranslations(locale)

  // useEffect(() => {
  //   console.log('Re-rendered form');
  // }, [formRef.current]);   

  // generate browser url based on models and characters
  useEffect(() => {
    // console.log('checking url')
    router.replace(urlToReplace)
  }, [router, urlToReplace])

  // trap escape key to interrupt responses
  // FIXME Warning: React Hook useEffect has a missing dependency: 'handleStop'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (e:any) => {
      const event = e as React.KeyboardEvent
      if (event.key !== "Escape") {
        return;
      }
      // if commented out, not work with safari with IME
      if (isUsingIME.current) {
        // console.log('using ime', new Date)
        return;
      }
      e.preventDefault();
      handleStop()
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const changeChatLoading = (index:number, value:boolean) => {
    setIsLoadingAnyChat(chats.some((chat:UseChatHelpers) => chat.isLoading))
  }

  const setChatOptions = (index:number, chat:UseChatHelpers) => {
    chats[index] = chat
  }

  const onChangeCharacter = (index:number, character:Character) => {
    const newValues = modelCharacterValues.map((value, i) =>
      i !== index ? value : {modelValue: value.modelValue, characterValue:character.value}
    )
    console.log('changing to new character', newValues)
    setModelCharacterValues(newValues)
  }

  const onChangeModel = (index:number, modelValue:ModelValue) => {
    const newValues = modelCharacterValues.map((value, i) =>
      i !== index ? value : {modelValue: modelValue, characterValue:value.characterValue}
    )
    console.log('changing to new models', newValues)
    setModelCharacterValues(newValues)
  }

  const removeModel = (index:number) => {
    const newValues = modelCharacterValues.filter((_, i) => i !== index)
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    splitSizes = splitToArray(newValues.length)
  }

  const addModel = () => {
    const newValues = [
      ...modelCharacterValues, 
      {modelValue: DEFAULT_MODEL.modelValue, characterValue: DEFAULT_CHARACTER_VALUE}
    ]
    console.log('changing to new models', newValues, splitToArray(newValues.length))
    setModelCharacterValues(newValues)
    splitSizes = splitToArray(newValues.length)
  }

  // You can debug by adding onDragStart={onDragStart} to with <Split />
  // const onDragStart = (sizes:number[]) => {
  //   console.log('current sizes=', sizes)
  // }

  const updatePaneSize = (updateIndex:number, operation:'minimize' | 'maximize' | 'restore') => {
    // const currentValue = splitSizes[updateIndex]
    // // console.log('index=', updateIndex, ', operation=' + operation, 'currentValue=', currentValue)

    // // check current state and overwrite operation
    // switch (operation) {
    //   case 'minimize':
    //     if (currentValue === 0) operation = 'restore'
    //     break;
    //   case 'maximize':
    //     if (currentValue === 100) operation = 'restore'
    //     break;
    //   default:
    //     console.log('unexpected operation=' + operation + ', index=' + updateIndex)
    //     break;
    // }

    // // do the actual operation
    // const operations:any = {
    //   'minimize': calcMinimizePaneSizes, 
    //   'maximize': calcMaximizePaneSizes, 
    //   'restore': calcRestorePaneSizes
    // }
    // const calcSizes = operations[operation] as (updateIndex:number) => number[]
    // const newSizes = calcSizes(updateIndex)
    // splitSizes = newSizes

    // function calcMinimizePaneSizes(updateIndex:number) {
    //   // e.g. [33.3, 33.3, 33.3] => [50, 50, 0]
    //   const updateSize = 0
    //   const otherSize = 100/(splitSizes.length - 1)

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? updateSize : otherSize
    //   )

    //   // console.log('min=', newSizes)
    //   return newSizes
    // }
    // function calcMaximizePaneSizes(updateIndex:number) {
    //   // e.g. [33.3, 33.3, 33.3] => [0, 0, 100] 
    //   // sizes will be adjusted to min by the library automatically
    //   const updateSize = 100
    //   const otherSize = 0

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? updateSize : otherSize
    //   )

    //   // console.log('max=', newSizes)
    //   return newSizes
    // }
    // function calcRestorePaneSizes(updateIndex:number) {
    //   // e.g. [50, 50, 0] => [33.3, 33.3, 33.3]
    //   // [0, 0, 100] => [33.3, 33.3, 33.3]
    //   const averageSize = 100/(splitSizes.length) // 33.3
    //   if (splitSizes.length === 1) {
    //     console.log('unexpected splitSizes')
    //     return;
    //   }
    //   const adjustValue = (currentValue - averageSize)/(splitSizes.length - 1) // -33.3/2

    //   const newSizes = splitSizes.map((size, index) => 
    //     index === updateIndex ? averageSize : size + adjustValue
    //   )

    //   // console.log('restore=', newSizes)
    //   return newSizes
    // }
  }

  // form submit handler
  // submit all children chats
  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    eventBus.emit(EventName.onSubmitBroadcastMessage);
    setParentInput('')
    setImageUrl('')
  }

  // stop chat
  const handleStop = () => {
    eventBus.emit(EventName.onStopAll);
  }

  const handleTrash = () => {
    // Stop to prevent getting responses after trash
    handleStop()
    console.log('trashing')
    eventBus.emit(EventName.onResetAll);
  }

  // Need to set the initialsizes to keep the resizes after updating the inputs
  function handleVerticalResize(gutterIdx: number, allSizes: number[]) {
    // console.log('gutterIdx', gutterIdx);
    // console.log('vertical allSizes in %', allSizes);
    setVerticalSizes(allSizes);
  }
  function handleHorizontalResize(gutterIdx: number, allSizes: number[]) {
    // console.log('gutterIdx', gutterIdx);
    // console.log('horizontal allSizes in %', allSizes);
    setHorizontalSizes(allSizes);
  }
    
  return (
  <Splitter initialSizes={verticalSizes} direction={SplitDirection.Vertical} draggerClassName='dragger-vertical' gutterClassName="gutter gutter-vertical" key={modelCharacterValues.length} classes={['flex-1 flex flex-row text-xs overflow-auto min-h-0', 'w-screen bottom-0 flex min-h-20']} onResizeFinished={handleVerticalResize}
  >
    {/* 275 is the longest model label in Japanese */}
    <Splitter initialSizes={horizontalSizes} direction={SplitDirection.Horizontal} minWidths={Array(modelCharacterValues.length).fill(275)} draggerClassName='dragger-horizontal' gutterClassName="gutter gutter-horizontal" onResizeFinished={handleHorizontalResize}>
      {modelCharacterValues.map((value:ModelCharacterPair, index:number) => {
        const key = index + ':' + value.modelValue + ':' + value.characterValue
        const hasClosePaneButton = modelCharacterValues.length > 1
        const hasAddPaneButton = index === modelCharacterValues.length - 1
        return (
          <Chat key={key} index={index} 
            hasClosePaneButton={hasClosePaneButton} hasAddPaneButton={hasAddPaneButton}
            modelValue={value.modelValue} character={getCharacter(value.characterValue)}
            setChatOptions={setChatOptions} onChangeModel={onChangeModel} onChangeCharacter={onChangeCharacter}
            changeChatLoading={changeChatLoading}
            addPane={addModel} removePane={removeModel} 
            onCompositeChange={(value)=>isUsingIME.current = value}
            inputValue={parentInput} imageUrl={imageUrl}
            />
      )})}
    </Splitter>
    <form ref={formRef} onSubmit={handleChatSubmit} className='w-screen bottom-0 flex flex-row text-xs'>
      <div className='flex-1 flex flex-col'>
        <EnterableTextarea 
          autoFocus={true}
          className="m-1 p-1 border flex-1 border-gray-300 rounded text-sm resize-none overflow-hidden"
          value={parentInput}
          onChange={(e)=>{
            const newValue = e.target.value
            setParentInput(newValue); 
          }}
          onEnter={()=>{
            formRef?.current?.requestSubmit()
          }}
          onCompositeChange={(value)=>isUsingIME.current = value}
          placeholder={t('parentInputPlaceholder')}
        />

        <div className={'mb-1 p-1 flex-1 flex flex-row ' + (hasVisionModel ? '' : ' hidden')}>
          {/* <button className={'mx-1 ' + (fileSelected ? 'text-teal-700 active:text-teal-600' : '')} onClick={() => fileImageRef.current?.click()}>
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Upload</span>
          </button> */}
          <input type="file" accept="image/jpeg, image/png, image/gif, image/webp" 
            onChange={(evt) => {
              // Read the file content and convert to data URI in the client side
              const selectedFile = evt.target.files![0];
              // setFileSelected(!!selectedFile)
              if (!selectedFile) {
                setImageUrl('')
                return
              }
          
              const reader = new FileReader();
              reader.onload = () => {
                const dataImageUrl = reader.result as string
                setImageUrl(dataImageUrl);
              };
              reader.readAsDataURL(selectedFile);
            }}/>
          <input type="text" className='flex-1 border border-gray-300rounded'
            placeholder={t('imageUrlPlaceholder')} 
            value={imageUrl}
            onChange={(e)=>{setImageUrl(e.currentTarget.value)}}/>
        </div>
      </div>

      {/* disabled is useful to stop submitting with enter */}
      <button type="submit" 
        className={(isLoadingAnyChat ? 'disabled:hidden' : '') 
          + ' p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'} 
        disabled={parentInput.length === 0 || isLoadingAnyChat}>
        <SendIcon className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </button>
      <button onClick={handleStop} 
        className={'p-1 disabled:hidden disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'}
        disabled={!isLoadingAnyChat}>
        <StopCircleIcon className="h-5 w-5" />
        <span className="sr-only">Stop</span>
      </button>
      <button onClick={handleTrash} 
        className='p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'>
        <Trash2Icon className="size-5" />
        <span className="sr-only">Trash</span>
      </button>
    </form>
  </Splitter>
  );
}
