import { useRef } from "react"

export default function EnterableTextarea({className = '', autoFocus, value = '', onChange, onEnter, onCompositeChange, placeholder = ''}:{
    className:string,
    autoFocus?:boolean,
    value:string, 
    onChange:(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>)=>void, 
    onEnter:()=>void,
    onCompositeChange?:(newValue:boolean)=>void,
    placeholder:string},
) {
    const isUsingIME = useRef(false)
    
    // trigger enter key
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        // console.log(e.currentTarget.value)

        // submit only if the key is enter
        if (e.key !== 'Enter' || e.shiftKey)
        return;

        if (isUsingIME.current) {
        // console.log('using ime', new Date)
        return;
        }
        
        e.preventDefault();

        onEnter();
    }

    return (
        <textarea
        autoFocus={autoFocus}
        className={className}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onCompositionStart={() => setTimeout(() => {
          // To deal with the situation CompositionEnd then CompositionStart, both needs timeout
          // console.log('start', new Date)
          isUsingIME.current = true
          if (onCompositeChange) onCompositeChange(true)
        }, 0)}
        onCompositionEnd={() => setTimeout(() => {
          // Needs timeout as Safari triggers CompositionEnd before KeyDown when pushing Enter
          // console.log('end', new Date)
          isUsingIME.current = false
          if (onCompositeChange) onCompositeChange(false)
        }, 0)}
        placeholder={placeholder}
      />
    )    
}