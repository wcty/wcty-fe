import FloatButtons from 'containers/FloatButtons'
import Slides from 'containers/Slides'
import { getLangServerSideProps, ServerI18nProps, useServerI18n } from 'common'
import FloatPanel from 'containers/FloatPanel'
import Sidepanel from 'containers/Sidepanel'
import Head from 'next/head'
import DefaultInitiativeCover from 'assets/images/wecity_chat_512.png'
import Intro from 'containers/Intro'
import { MapWrapper } from 'styles'
import { lazy, Suspense } from 'react'
const MapContents = lazy(()=>import('containers/MapContents'))
const Map = lazy(()=>import('components/Map'))

export const getServerSideProps = getLangServerSideProps

export default function RootPath(props:ServerI18nProps) {
  useServerI18n(props)
  const name = "Welcome to Wecity platform"
  const description = "A small introduction into how Wecity works."

  return <>
    <Head>
      <title>{`${name} | Wecity`}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={DefaultInitiativeCover} />
      <meta property="og:title" content={name} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Wecity" />
      <meta property="twitter:card" content="summary" />
      <meta property="twitter:title" content={name} />
      <meta property="twitter:description" content={description} />
    </Head>
    <MapWrapper>
      <Suspense fallback={null}>
        <Map>
          <MapContents/>
        </Map>
      </Suspense>
    </MapWrapper>
    <FloatButtons/>
    <FloatPanel/>
    <Intro/>
    <Sidepanel/>
  </>
}
