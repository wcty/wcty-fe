import { Source, FeatureState } from '@urbica/react-map-gl';
import { atoms } from 'common';
import { startTransition, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Map, MapboxGeoJSONFeature } from 'mapbox-gl'
import { waitForFeatures } from '.';

export default function MapContents({map}:{map:Map}){
  const [selected] = useRecoilState(atoms.selected)
  const [focus] = useRecoilState(atoms.focalPoint)
  const [viewport, setViewport] = useRecoilState(atoms.viewport)
  const [cluster, setCluster] = useState<GeoJSON.FeatureCollection>({type: 'FeatureCollection', features: []})

  useEffect(()=>{
    setTimeout(async ()=>{
      const features = await waitForFeatures(
        ()=>map?.getSource('entries') && map?.querySourceFeatures('entries', {sourceLayer:'public.entries'})
      )
      if(features)
        startTransition(()=>setCluster({type: 'FeatureCollection', features}))
    }, 250)
  },[viewport, map, selected])
  
  return <>
    <Source
      id='pin'
      type='geojson'
      data={{
        type: 'Feature',
        properties:{},
        geometry: {
          type: 'Point',
          coordinates: focus||[30.52,50.45]
        }
      }}
    />
    <Source
      id='entries'
      type='vector'
      url='https://tiles.weee.city/public.entries.json'
      promoteId='id'
    />
    <Source 
      id='entries-clusters'
      type='geojson'
      promoteId='id'
      data={cluster}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    />
    <Source
      id='selected_entry'
      type='geojson'
      data={{
        type:'Feature',
        geometry: selected?.geometry||{type:'Point',coordinates:[0,0]},
        properties: selected?.properties||{}
      }}
      promoteId='id'
    />
  </>
}
