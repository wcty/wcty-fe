import { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Fab, Collapse } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab';
import { useRecoilState, useRecoilValue } from 'recoil'
import { atoms } from 'shared'
import { Menu as MenuIcon } from '@material-ui/icons'
import s from './styles.module.scss'
import App from 'App';

export default ()=>{
  const [alert, setAlert] = useState<null|{description:string}>(null)
  const user = useRecoilValue(App.user)
  const [initiativeBar, setInitiativeBar] = useRecoilState(atoms.initiativeBarAtom)
  const [drawer, setDrawer] = useState(false)

  return (
    <>
      <>
        <Fab 
          onClick={()=>{setDrawer(!drawer)}}
          className={s.MenuFab} 
          style={{
            top: initiativeBar?'unset':'1rem',
            bottom: initiativeBar?'1rem':'unset',
            position:'absolute'
          }}
          aria-label="add"
        >
          <MenuIcon />
        </Fab>
      </>
    { alert && !user && (
      <Collapse in={Boolean(alert)}>
        <Alert severity="info" className={s.alert} onClose={() => {setAlert(null)}}>
          <AlertTitle>Info</AlertTitle>
          {alert?.description}
        </Alert>
      </Collapse>
    )

    }
    </>
  )
}