import { Layer, Source, FeatureState } from '@urbica/react-map-gl';
import { Map } from 'components';
import { useRecoilState } from 'recoil';
import InitiativeCard from 'components/InitiativeCard';

export default function MapContents(){
  const [cursor, setCursor] = useRecoilState(Map.cursor)
  const [selected, setSelected] = useRecoilState(Map.selected)
  const [viewport, setViewport] = useRecoilState(Map.viewport)
  const [layers, setLayers] = useRecoilState(Map.layers)

  
  return <>
    <Source
      id='map_entries'
      type='vector'
      url='https://tiles.weee.city/public.map_entries.json'
      promoteId='id'
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

    <Layer
      id='map_entries'
      source='map_entries'
      source-layer='public.map_entries'
      type='symbol'
      onClick={({features})=>{
        const feature = JSON.parse(JSON.stringify(features[0])) as typeof features[number]
        console.log(feature)
        if(feature.id!==selected?.id){
          console.log(feature.id)
          setViewport({
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
            zoom: 16,
            viewportChangeMethod: 'easeTo',
            viewportChangeOptions: {offset:[145,50]}
          })
          setSelected({
            ...feature,
            geometry: feature.geometry
          })
        }
      }}
      onEnter={()=>setCursor('pointer')}
      onLeave={()=>setCursor('')}
      paint={{
        'text-color': 'black',
        'text-opacity': ['step', ['zoom'], 0, 15, 1 ],
        'text-halo-width': 1,
        'text-halo-color': 'white',   
      }}
      layout={{
        'icon-image': ['case', ['==',['get', 'type'],'initiative'],'initiative','org'],
        'icon-anchor': 'bottom-left',
        'icon-allow-overlap': false,
        'icon-ignore-placement': false,
        'icon-size': ['interpolate',
          ['linear'],
          ['zoom'],
            9, ['case',['==',['id'], selected?.id||''], 1, 0.2],
            16, ['case',['==',['id'], selected?.id||''], 1.8, 1.35]
        ],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'symbol-spacing': 1,
        // 'text-field': ['get', 'name'],
        'text-anchor': 'top',
        'text-font': ['Montserrat SemiBold'],
        'text-size': 13,
        'text-padding': 0,
        'text-offset': [0, 0]
      }}
      filter={
        layers.length===2? ['!=',['id'],'']:
        layers.includes('initiative')?
        ['case', ['==',['get','type'],'initiative'], true, false]:
        ['case', ['==',['get','type'],'organization'], true, false]
      }
    />
    <Layer
      id='selected_entry'
      source='selected_entry'
      type='symbol'
      onEnter={()=>setCursor('pointer')}
      onLeave={()=>setCursor('')}
      paint={{
        'text-color': 'black',
        'text-opacity': ['step', ['zoom'], 0, 15, 1 ],
        'text-halo-width': 1,
        'text-halo-color': 'white',   
      }}
      layout={{
        'icon-image': ['case', ['==',['get', 'type'],'initiative'],'initiative','org'],
        'icon-anchor': 'bottom-left',
        'icon-allow-overlap': false,
        'icon-ignore-placement': false,
        'icon-size': ['interpolate',
          ['linear'],
          ['zoom'],
            9, ['case',['==',['id'], selected?.id||''], 1, 0.2],
            16, ['case',['==',['id'], selected?.id||''], 1.8, 1.35]
        ],
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'symbol-spacing': 1,
        // 'text-field': ['get', 'name'],
        'text-anchor': 'top',
        'text-font': ['Montserrat SemiBold'],
        'text-size': 13,
        'text-padding': 0,
        'text-offset': [0, 0]
      }}
      filter={
        layers.length===2? ['!=',['id'],null]:
        layers.includes('initiative')?
        ['case', ['==',['get','type'],'initiative'], true, false]:
        ['case', ['==',['get','type'],'organization'], true, false]
      }
    />
    <FeatureState sourceLayer='public.map_entries' source='map_entries' id={selected?.id||''} state={{selected:true}}/>
    <>{ selected && <InitiativeCard entry={selected}/> }</>
  </>
}
