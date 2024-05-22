'use client';

import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuGroup, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { InfoIcon } from "lucide-react";
import { LocaleContext } from "@/lib/client/locale-context"
import { useContext } from "react";
import { getTranslations } from "@/lib/localizations";

export default function InfoLinks({selectedService, className}:{selectedService: 'mulai' | 'mulai3', className:string}) {
    const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)
        
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={className}>
            <InfoIcon />
            <span className="sr-only">Info</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
                <a className={(selectedService === "mulai" ? 'font-semibold ' : '') + " size-full"} 
                    href="https://mulai.vercel.app/" title={t('mulaiTitleLabel')}>Mulai</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className={(selectedService === "mulai3" ? 'font-semibold ' : '') + " size-full"} 
                    href="https://mulai3.vercel.app/" title={t('mulai3TitleLabel')}>Mulai3</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" 
                    href="https://forms.gle/7TrHHb1mfRmwjg8R6" title={t('surveyLabelTitle')}
                    target="_blank" rel="noopener noreferrer">{t('surveyLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                {/* Copyright twk. All rights reserved. */}
                <a className="size-full" 
                    href="https://twitter.com/twk" title="Copyright twk. All rights reserved."
                    target="_blank" rel="noopener noreferrer">{t('authorLabel')}</a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
