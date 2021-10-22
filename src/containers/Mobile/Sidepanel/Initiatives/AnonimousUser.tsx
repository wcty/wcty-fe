import { useI18n } from 'common';
import { UserIconRow, List } from "../styles";
import { useInitiativesNearbyListQuery } from "generated";
import { useRecoilState } from "recoil";
import { Map } from 'components'
import { useEffect, useState } from "react";
import { ListRow } from "components";
import Sidepanel from "..";
import BurgerFab from 'containers/Mobile/FloatPanel/BurgerFab';

export default function InitiativesDrawer(){
  const i18n = useI18n()
  const [view] = useRecoilState(Map.viewport)
  const [selected, setSelected] = useRecoilState(Map.selected)
  const location = {
    type: 'Point',
    coordinates: [view.longitude, view.latitude]
  }
  console.log(location)
  const { data, error, variables } = useInitiativesNearbyListQuery({variables:{ location, limit: 10 }})
  const [ initiatives, setInitiatives ] = useState(data)
  const [open, setOpen] = useRecoilState(Sidepanel.open)

  useEffect(()=>{
    console.log('anon',data,variables)

    if( data && data?.initiatives_nearby.length>0 ){
      setInitiatives(data)
    }
  },[data,variables])

  return <>
    <div>
      <UserIconRow>
          <span>
            <BurgerFab/>{i18n('initiatives')}
          </span>
          <span style={{fontSize: 10}}>
            {/* {'1111 initiatives'} */}
          </span>
      </UserIconRow>
      <List>
        {initiatives?.initiatives_nearby.map((v,key)=>
          <ListRow onClick={()=>setOpen(false)} data={{...v, type: 'initiative'}}  {...{key}}/>)}
      </List>
    </div>
  </>
}
