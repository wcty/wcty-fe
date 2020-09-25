import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Button, Divider, InputAdornment, Avatar, Typography, Box, TextField, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { useI18n } from 'global/Hooks'
import { useDatabase, useUser, useDatabaseListData, useFirestore, useFirestoreDocData, useDatabaseObjectData } from 'reactfire'
import { useParams, useHistory, Route } from 'react-router-dom'
import { Send, ThumbUpOutlined, ThumbUp, ThumbDownOutlined, ThumbDown, ModeCommentOutlined } from '@material-ui/icons'

const DateComponent = (props)=>{
  return <Typography style={{textAlign:"center", margin: "0.5rem", marginTop:"1rem"}} variant="body2">{props.children}</Typography>
}

const Type = (props)=>{
  return <Typography style={{textAlign:"center", margin: "0.5rem", marginBottom: "1rem"}} variant="body2">{props.children}</Typography>
}

export default ({initiative, m, n})=>{

  n = n || 0
  const initiativeID = initiative.id
  const user = useUser()
  const i18n = useI18n()
  const history = useHistory()
  const messages = useDatabase().ref(`chats/${initiativeID}/messages/`)
  useEffect(()=>{
    if(Object.keys(m).length===0) history.replace(`/initiative/${initiativeID}`)
  },[m])
  return Object.keys(m).length!=0 && <Box key={n}>
    {(m.type!=='message') && <>
      <DateComponent>{m.timestamp.replace("T"," at ").split(":").slice(0,2).join(":")}</DateComponent>
      <Type>{i18n('chatCreatedInitiative', m.user.name)}</Type>
    </>}

    <Box style={{
      backgroundColor:"white", 
      borderColor:"rgba(0,0,0,0.1)", 
      borderWidth:"1px",
      borderStyle: "solid",
      padding:"1rem",
      marginBottom:'0.2rem',
    }} >
      <div style={{verticalAlign:"middle", marginTop:m.showAvatar?"1.5rem":"0.2rem", display:"flex", justifyContent: "start" }}>
        {/* <Avatar alt={m.user.name} src={m.user.avatar} >{m.user.name.split(' ').map(l=>l.slice(0,1).toUpperCase()).join('')}</Avatar>
        <Typography variant="subtitle2" style={{marginRight:"0.5rem"}}>{m.user.name}</Typography>
        <Typography variant="body2" style={{marginRight:"0.5rem"}}>{initiative.members[m.user.id].role}</Typography> */}
      <ListItem disableGutters style={{padding:0}}>
        <ListItemAvatar>
          <Avatar alt={m.user.name} src={m.user.avatar} >{m.user.name.split(' ').map(l=>l.slice(0,1).toUpperCase()).join('')}</Avatar>
        </ListItemAvatar>
        <ListItemText 
          primary={m.user.name}
          secondary={
            initiative.members[m.user.id].role + ' | ' + 
            m.timestamp.replace("T"," at ").split(":").slice(0,2).join(":")
          }
        />
      </ListItem>
      </div>
      
      <Typography variant="body1">
        {m.text}
      </Typography> 
      <Divider style={{margin:"0.5rem 0"}}/>
      <Button onClick={()=>{
        if(m.likes&&m.likes[user.id]){
          var updates = {};
          updates['/likes/' + user.id] = null;
          messages.child(m.id).update(updates)
        }else{
          var updates = {};
          if(m.dislikes&&m.dislikes[user.id]){
            updates['/dislikes/' + user.id] = null;
          }
          updates['/likes/' + user.id] = true;
          messages.child(m.id).update(updates)
        }
      }}>
        {(m.likes&&m.likes[user.id])?<ThumbUp />:<ThumbUpOutlined />}
        <span style={{marginLeft:'0.5rem'}}>{m.likes?Object.keys(m.likes).length:0}</span>
      </Button>
      <Button onClick={()=>{
        if(m.dislikes&&m.dislikes[user.id]){
          var updates = {};
          updates['/dislikes/' + user.id] = null;
          messages.child(m.id).update(updates)
        }else{
          var updates = {};
          if(m.likes&&m.likes[user.id]){
            updates['/likes/' + user.id] = null; 
          }
          updates['/dislikes/' + user.id] = true;
          messages.child(m.id).update(updates)
        }
      }}>
        {(m.dislikes&&m.dislikes[user.id])?<ThumbDown />:<ThumbDownOutlined />}
          <span style={{marginLeft:'0.5rem'}}>{m.dislikes?Object.keys(m.dislikes).length:0}</span>
      </Button>
      <Button onClick={()=>{history.push(`/initiative/${initiativeID}/post/${m.id}`)}}>
        <ModeCommentOutlined/>
        <span style={{marginLeft:'0.5rem'}}>{m.commentsCount?Object.keys(m.commentsCount).length:0} Comments</span>
      </Button>
    </Box>
  </Box>
}