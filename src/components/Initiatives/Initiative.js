import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Collapse, Paper, Typography, IconButton, Box,Fab, List, ListItem, ListItemText, Button, TextField } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab';
import addImage from 'assets/images/addImage.png'
import { useRecoilState, useRecoilValue } from 'recoil'
import * as Atoms from 'global/Atoms'
import { useStorage, useFirestore, useUser, useFirestoreDocData } from 'reactfire'
import { People, LocationOn, ExpandLess, Close, ArrowBack, ArrowForward } from '@material-ui/icons'
import distance from '@turf/distance'
import translate from '@turf/transform-translate'
import ImageViewer from 'react-simple-image-viewer'
import { useI18n } from 'global/Hooks'
import { DeleteObject } from 'global/Misc'
import moment from 'moment'
import { useParams, Route, useHistory } from 'react-router-dom'
import {Helmet} from "react-helmet"
import { Share } from '@material-ui/icons'
import SelectRole from './SelectRole'
import InitiativeGroup from './InitiativeGroup'
import InitiativeTopic from './InitiativeTopic'
import { useQuery, useMutation } from '@apollo/client'
import { getInitiative, updateInitiativeMember, deleteInitiative } from 'global/Queries'

const useStyles = makeStyles((theme) => ({
  paper:{
    // height: "100%",
    minHeight: "250px",
    // width: "100%",
    overflowX: "hidden",
    // flexGrow: 1,
    zIndex: 10,
    position: 'fixed',
    transitionDuration: '0.3s',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 400,
		},
  },
  img: {
    height: '160px',
    maxWidth: 400,
    overflow: 'hidden',
    display: 'block',
    width: '100%',
    margin: "auto",
    verticalAlign: 'middle',
    objectFit: 'cover'
  },
  info: {
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  alert: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 999,
    maxWidth: 'calc( 100% - 4rem )'
  }
}));

export default ({ mapRef, loaded })=> {
  const classes = useStyles();
  const initiatives = useRecoilValue(Atoms.markersAtom)?.features
  let { initiativeID, postID } = useParams();
  const vars = {variables: {UID: initiativeID}}
  const { loading, error, data, refetch } = useQuery(getInitiative, vars);
  const initiative = useMemo(()=>data?.initiative, [data])
  if (loading) console.log('loading');
  if (error) console.log('error', error);

  const [location] = useRecoilState(Atoms.locationAtom)
  const [expanded, setExpanded] = useRecoilState(Atoms.expanded)
  const mapDimensions = useRecoilValue(Atoms.mapAtom)
  const bar = useRecoilValue(Atoms.barAtom)
  const user = useUser()
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [markers, setMarkers] = useRecoilState(Atoms.markersAtom)
  const [joining, setJoining] = useRecoilState(Atoms.joiningAtom)
  const images = useStorage().ref().child('initiatives')
  const i18n = useI18n()
  const [alert, setAlert] = useState(null)
  const [sp, setSP] = useRecoilState(Atoms.swipePosition)
  const history = useHistory()
  const [updateMember, memberData] = useMutation(updateInitiativeMember)
  const [deleteInitiativeMutation, removeData] = useMutation(deleteInitiative)

  useEffect(()=>{
    if(markers.features.length>0&&sp!==0){
      if(sp<=(markers.features.length-1) ){
        console.log('sp1')

        history.push(`/initiative/${markers.features[sp].properties.uid}`)
      }else{
        setSP(markers.features.length-1)
      }
    }
  },[sp, markers.features, initiativeID])

  useEffect(()=>{
    console.log('here', initiative)
    if((!initiative||!initiative.properties)&&!loading){
      history.push('/')
    }
  }, [initiative])
  
  useEffect(()=>{
    
      if(loaded&&initiative&&initiative.properties){
        const map = mapRef.current.getMap()
        const center = Object.values(initiative.geometry.coordinates)
        const w = mapDimensions.width/2
        const h = (mapDimensions.height - 350)/2
        const offPoint = Object.values(map.unproject([w,h]))
        const point = Object.values(map.getCenter())
        const dist = distance(point, offPoint)
        const newOffPoint = translate({
          type:"FeatureCollection",
          features:[
            {
              type: "Feature",
              geometry:{
                type: "Point",
                coordinates: center
              }
            }
          ]
        }, dist, 180)
        newOffPoint.features[0].geometry.coordinates && map.flyTo({ center: newOffPoint.features[0].geometry.coordinates });
      } 
  }, [mapRef, loaded, initiative, mapDimensions.width, mapDimensions.height])

  useEffect(()=>{
    if(postID){setExpanded(true)}else{setExpanded(false)}
  },[initiativeID, setExpanded])

  return (<>
    { !user.isAnonymous && initiative && initiative.properties && initiative.properties.members.find(m=>m.uid===user.uid) && (<>
      <Route path={'/initiative/:initiativeID/post/:postID'} >
        <InitiativeTopic initiative={initiative} />
      </Route>
    </>)}
    {alert && (
      <Collapse in={Boolean(alert)}>
        <Alert severity="info" className={classes.alert} onClose={() => {setAlert(null)}}>
          <AlertTitle>Info</AlertTitle>
          {alert==='loading'?i18n('loading'):
          <>{i18n('alertLinkWasCopied')}<br/>
          <form>
            <TextField style={{paddingBottom:'0.5rem', paddingTop:'0.5rem', width:'100%'}} value={alert}/>
          </form>
          </>}
        </Alert>
      </Collapse>
    )}
    {isViewerOpen && (<>
      <IconButton 
        aria-label="return"
        style={{position:"absolute", zIndex: 1000, right:"1.5rem", top:"0.5rem"}}
        onClick={()=>{
          setIsViewerOpen(false)
        }}
      >
        <Close  color="primary" />
      </IconButton>
      <ImageViewer
        src={ [initiative.properties.imageURL.l] }
        currentIndex={ 0 }
        onClose={ ()=>{ setIsViewerOpen(false) } }
        zIndex={9}
        style={{zIndex:9}}
      />
    </>)}

    { initiative && initiative.properties && !isViewerOpen && (
        <Paper 
          className={classes.paper} 
          style={{
            transition: 'all 0.3s',
            cursor: 'pointer', 
            borderRadius: expanded?'0':"5px",
            overflowY: expanded?'scroll':'hidden',
            minHeight: expanded?`calc(100% - ${bar.height}px)`:'250px',
            maxHeight: expanded?`calc(100% - ${bar.height}px)`:'400px',
            width: expanded?'100%':'calc( 100% - 2rem )',
            bottom: expanded?'0':"1rem",
            right: expanded?'0':"1rem",
            willChange: 'height, min-height, width, bottom, right'  
          }}
        > 
          {
            !expanded && <>
              <Fab onClick={()=>{setSP(prev=>prev>0?prev-1:0)}} style={{position: "fixed", transform: "translate( 50%, -50% )", zIndex: 15}}><ArrowBack/></Fab>
              <Fab onClick={()=>{setSP(prev=>prev+1)}} style={{position: "fixed", right:0, transform: "translate( -50%, -50% )", zIndex: 15}}><ArrowForward/></Fab>
            </>
          }
          <div id="wrapper">
          <Helmet>
            <title>{"We.city: "+initiative.properties.name}</title>
            <meta property="og:title" content={initiative.properties.name} />
            <meta property="og:site_name" content="We.city" />
            <meta property="og:description" content={initiative.properties.problem} />
            <meta property="og:url" content={"https://weee.city/initiative/"+initiative.properties.uid} />
            <meta property="og:image" content={initiative.properties.imageURL?initiative.properties.imageURL.l: addImage} />
          </Helmet>

          {/* Header Image */}
          <section 
            className={classes.img} 
            alt="Cover of the initiative"
            onClick={()=>{
              console.log('clicked on img')
              if(expanded&&initiativeID){
                setIsViewerOpen(true)
              }else{
                setExpanded(true)
              }
            }}
            style={{
              position:'relative',
              backgroundImage: `url(${initiative.properties.imageURL?initiative.properties.imageURL.s: addImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              borderTopLeftRadius: expanded?0:"5px",
              borderTopRightRadius: expanded?0:"5px"         
          }}>
          </section>

          {/* Actual Initiative */}
          <Box className={classes.info} 
            style={{position:'relative'}}
            onClick={()=>{
              console.log('clicked on card')
              setExpanded(!expanded)
            }}>
            {location && initiative.geometry.coordinates && (
            <span className={classes.span}>
              <LocationOn style={{fontSize: 'large'}} />
              {
                (distance([location.longitude, location.latitude], Object.values(initiative.geometry.coordinates)))<1 ? 
                (distance([location.longitude, location.latitude], Object.values(initiative.geometry.coordinates))*1000).toFixed(0) +i18n('initiativeDistanceFromMeM'):
                ((distance([location.longitude, location.latitude], Object.values(initiative.geometry.coordinates)))<10 ? 
                (distance([location.longitude, location.latitude], Object.values(initiative.geometry.coordinates))).toFixed(1) +i18n('initiativeDistanceFromMeKM'):
                (distance([location.longitude, location.latitude], Object.values(initiative.geometry.coordinates))).toFixed(0) +i18n('initiativeDistanceFromMeKM'))
              } 
            </span>)}
            {/* <span style={{float:'right'}}> <ExpandLess /></span> */}
            <span style={{marginLeft: location?"2rem":undefined}}>
              <People style={{fontSize: 'large'}} /> 
              {initiative.properties.members?initiative.properties.members.length:0}
            </span>
            <Typography variant="h6">
              {initiative.properties.name? initiative.properties.name: "Name is not set"}
            </Typography>
            <IconButton 
              aria-label="return"
              style={{
                position:"absolute", right:'2rem', top:"0rem",
                transitionDuration: '0.3s', transform: expanded?'rotate(180deg)':'rotate(0deg)'
              }}
              onClick={()=>{
                setExpanded(!expanded)
              }}
            >
              <ExpandLess />
            </IconButton>

            {/* Expanded view additions*/}

          </Box>
          {/* Content */}
          
            { expanded && !joining && 
            <Box style={{padding: '2rem', paddingTop: 0, paddingBottom: 0 }}>
              <List key='elements' disablePadding>
                {initiative.properties.problem&& (<ListItem className={classes.item} disableGutters>
                  <ListItemText
                    primary={i18n('initiativeProblem')}
                    secondary={initiative.properties.problem}
                  />
                </ListItem>)}
                {initiative.properties.outcome&& (<ListItem className={classes.item} disableGutters>
                  <ListItemText
                    primary={i18n('initiativeExpectedResult')}
                    secondary={initiative.properties.outcome}
                  />
                </ListItem>)}
                {initiative.properties.context && (<ListItem className={classes.item} disableGutters>
                  <ListItemText
                    primary={i18n('initiativeCurrentState')}
                    secondary={initiative.properties.context}
                  />
                </ListItem>)}
                {initiative.properties.timestamp && (<ListItem className={classes.item} disableGutters>
                <ListItemText
                  primary={i18n('initiativeDateAdded')}
                  secondary={moment(initiative.properties.timestamp.toDate()).format('DD.MM.YYYY')}
                />
              </ListItem>)}
              </List>
              <Box style={{display: "flex", justifyContent: "space-between"}}>
                <Button onClick={()=>{
                    // console.log('click', textarea)
                    // textarea.current.select();
                    // document.execCommand('copy');
                    //e.target.focus();
                    console.log(initiative)
                    if(alert!=="loading"){
                      setAlert("loading")                

                      fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyC0R35s-u9bZCZOpwg8jVIzYg77HeKgr0Y', {
                        method: 'post',
                        body: JSON.stringify({
                          "dynamicLinkInfo": {
                            "domainUriPrefix": "https://weee.city/in",
                            "link": `https://weee.city/initiative/${initiative.properties.uid}`,
                            "socialMetaTagInfo": {
                              "socialTitle": initiative.properties.name,
                              "socialDescription": initiative.properties.problem,
                              "socialImageLink": initiative.properties.imageURL.l,
                            }
                          },
                          "suffix": {
                            "option": "SHORT"
                          },
                        }),
                      }).then(function(response) {
                        return response.json();
                      }).then(function(text) {
                        console.log(text)
                        var dummy = document.createElement('input')
                        //text = `https://wecity.page.link/?link=https://weee.city/initiative/${initiative.properties.uid}&st=${initiative.properties.name}&sd=${initiative.properties.problem}&si=${encodeURI(initiative.properties.imageURL.l)}`;
        
                        document.body.appendChild(dummy);
                        dummy.value = text.shortLink;
                        dummy.select();
                        document.execCommand('copy');
                        document.body.removeChild(dummy);
                        setAlert(text.shortLink)                
                      });
                    }
                    }}>
                    <Share style={{paddingRight:"0.5rem"}} /> {i18n('initiativeShare')}
                  </Button>
                { !user.isAnonymous && initiative && !initiative.properties.members.find(u=>u.uid===user.uid) && <Button 
                  size="small" 
                  variant="contained"  
                  color="secondary"
                  onClick={async ()=>{    
                    console.log('Приєднатися')
                    setJoining(true)
                }}>
                  {i18n('join')}
                </Button>}
                { !user.isAnonymous && initiative && initiative.properties.members.find(u=>u.uid===user.uid) && (<>
                    {initiative.properties.members.length<2 ?
                    <Button 
                      size="small" 
                      variant="outlined"  
                      color="secondary"
                      onClick={()=>DeleteObject(initiative, null, images, 'initiatives', ()=>{
                        deleteInitiativeMutation({variables: { UID:initiative.properties.uid }})
                        setMarkers(prev=>({type: "FeatureCollection", features: prev.features.filter(m=>m.properties.uid!==initiative.properties.uid)}))
                        history.push('/')
                      })}
                    >
                      {i18n('delete')}
                    </Button>:
                    <Button 
                      size="small" 
                      variant="outlined"  
                      color="secondary"
                      onClick={()=>{
                        updateMember({variables: { UID:initiative.properties.uid, member:{uid: user.uid} }})
                        refetch()
                        const newMarkers = markers.features.map(marker=>{
                          if(marker.properties.uid===initiative.properties.uid){
                            const nProps = {...marker.properties, ...{ members: marker.properties.members.filter(mem=>mem.uid!==user.uid)}}
                            const nMarker = { ...marker, properties: nProps}
                            return nMarker
                          }
                          return marker
                        })
                        setMarkers({type: "FeatureCollection", features: newMarkers })
                      }}
                    >
                      {i18n('leave')}
                    </Button>}
                  </>)
                }
                </Box> 
              { !user.isAnonymous && initiative.properties.members.find(m=>m.uid===user.uid) && (<>
                  <InitiativeGroup initiative={initiative}/>
              </>)}
            </Box>
            }

            { expanded && joining && 
              <Box style={{padding: '2rem', paddingTop:0}}>
                <SelectRole refetch={refetch} />
              </Box>
            }
          
          </div>
        </Paper>
    )
  }</>)
}