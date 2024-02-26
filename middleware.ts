import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'

const supportedLocales = ['en', 'ja'];
const defaultLocale = 'en';
const COOKIE_NAME_LOCALE = 'locale'

// search parameter (?locale=ja|en) > cookie (locale) > browser accept-language (accept-language)
function getLocale(req:NextRequest) {
    const headerMap:any = { 'accept-language': 
        getLocaleFromSearchParam(req) ?? getLocaleFromCookie() ?? getLocaleFromHeader(req) 
    };
    // console.log(headerMap)

    const negotiator = new Negotiator({ headers:headerMap });
    const locale = match(negotiator.languages(), supportedLocales, defaultLocale);
    // console.log('mid', locale)

    return locale
}

function getLocaleFromSearchParam(req:NextRequest) {
    const specifiedLocale = req.nextUrl.searchParams.get('locale')
    return specifiedLocale 
}

function getLocaleFromCookie() {
    const cookieStore = cookies()
    const cookie = cookieStore.get(COOKIE_NAME_LOCALE)
    return cookie?.value
}

function getLocaleFromHeader(req:NextRequest) {
    return req.headers.get('accept-language')
}

export default function middleware(req:NextRequest) {
    const locale = getLocale(req)
    // console.log('loc=' + locale)

    // app uses req header
    // clone and add REQUEST header https://vercel.com/templates/next.js/edge-functions-modify-request-header
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-negotiated-locale', locale)  

    const res = NextResponse.next({request: { headers: requestHeaders }})

    // cookie is for the next access
    // one month - confirmed Max-Age browser header is set in seconds
    res.cookies.set(COOKIE_NAME_LOCALE, locale, {maxAge: 60 * 24 * 30})

    return res
}
