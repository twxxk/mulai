"use client";

/**
 * This code was originally generated by v0 by Vercel.
 * @see https://v0.dev/t/YdhQH0qpSDi
 */
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuGroup, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { GlobeIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type LocaleInfo = { value: string, label: string }

const locales:LocaleInfo[] = [
  {value: 'en', label: 'English'},
  {value: 'ja', label: '日本語'},
]

export function LanguageSelector({locale, className}:{locale:string, className:string}) {
  const pathname = usePathname();
  const searchParams = useSearchParams()

  // https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
 
      return params.toString()
    },
    [searchParams]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={className}>
          <GlobeIcon />
          <span className="sr-only">Language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {locales.map((item:LocaleInfo) => {
            if (item.value === locale) {
              return <DropdownMenuItem key={item.value}>
                <span className='font-semibold'>{item.label}</span>
              </DropdownMenuItem>
            } else {
              return <DropdownMenuItem key={item.value}>
                <a className="size-full" href={pathname + '?' + createQueryString('locale', item.value)}>{item.label}</a>
              </DropdownMenuItem> 
            }
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
