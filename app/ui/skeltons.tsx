import { SendIcon, Trash2Icon } from "lucide-react";

export function ChatSkelton() {
    return (
        <div className="flex flex-col w-full pt-2 h-full">
          <div className='px-3'>
          </div>

          <div className='flex-1 min-h-3 overflow-y-auto w-full'>
          </div>
     
          <form className='bottom-0 bg-slate-50 px-2 pt-1 rounded-sm'>
          </form>
        </div>
    );
}

export function ChatsAreaSkeleton() {
    return (
      <>
        {/* <Split minSize={50} sizes={[95, 5]} direction="vertical" className="flex-1 w-full m-0 flex flex-col"> */}
        <div className="flex-1 w-full m-0 flex flex-col">
            {/* <Split gutterSize={8} minSize={180} sizes={[100/3, 100/3, 100/3]} className="flex flex-row text-xs overflow-auto flex-1"> */}
            <div className="flex flex-row text-xs overflow-auto flex-1">
                <ChatSkelton />
                <div className="gutter gutter-horizontal w-[24px]"></div>{/* 24px rather than 8px for some reason */}
                <ChatSkelton />
                <div className="gutter gutter-horizontal w-[24px]"></div>{/* 24px rather than 8px for some reason */}
                <ChatSkelton />
            {/* </Split> */}
            </div>
            <form className='w-screen h-12 bottom-0 flex text-xs'>
            <textarea
                className="p-2 border border-gray-300 rounded flex-1 text-sm m-1 resize-none overflow-hidden"
                placeholder="Say something to all models..."
            />
            <button type="submit" 
                className={'p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'} 
                disabled={true}
                >
                <SendIcon className="h-5 w-5" />
                <span className="sr-only">Send</span>
            </button>
            <button
                className='p-1 disabled:text-gray-300 enabled:text-teal-900 enabled:hover:text-teal-700 enabled:active:text-teal-600'>
                <Trash2Icon className="h-5 w-5" />
                <span className="sr-only">Trash</span>
            </button>
            </form>
        </div>  {/* </Split> */}
      </>
    );
  }