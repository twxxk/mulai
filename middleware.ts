import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';

// get locale for the app based on the search parameter and the request header
function getLocale(req:NextRequest) {
    const supportedLocales = ['en', 'ja'];
    const defaultLocale = 'en';

    const specifiedLocale = req.nextUrl.searchParams.get('locale')
    const headerMap:any = { 'accept-language': specifiedLocale ?? req.headers.get('accept-language') };    
    // console.log(headerMap)

    const negotiator = new Negotiator({ headers:headerMap });
    const locale = match(negotiator.languages(), supportedLocales, defaultLocale);
    // console.log('mid', locale)

    return locale
}

export default function middleware(req:NextRequest) {
    // clone and add REQUEST header
    // https://vercel.com/templates/next.js/edge-functions-modify-request-header
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-negotiated-locale', getLocale(req))  
    return NextResponse.next({
        request: { headers: requestHeaders },
    })    
}
