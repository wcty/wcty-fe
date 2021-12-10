import { useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import { useUser } from ".";
import { http } from "../functions";
//the function to call the push server: https://github.com/Spyna/push-notification-demo/blob/master/front-end-react/src/utils/http.js

import {
  isPushNotificationSupported,
  askUserPermission,
  // registerServiceWorker,
  createNotificationSubscription,
  getUserSubscription
} from "../functions";
//import all the function created to manage the push notifications

const pushNotificationSupported = isPushNotificationSupported();
//first thing to do: check if the push notifications are supported by the browser

export function usePushNotifications() {
  const [userConsent, setSuserConsent] = useState(Notification.permission);
  //to manage the user consent: Notification.permission is a JavaScript native function that return the current state of the permission
  //We initialize the userConsent with that value
  const [userSubscription, setUserSubscription] = useState<PushSubscription | null>(null);
  //to manage the use push notification subscription
  const [pushServerSubscriptionId, setPushServerSubscriptionId] = useState<string>();
  //to manage the push server subscription
  const [error, setError] = useState<false|null|{name:string,message:string,code:number}>(null);
  //to manage errors
  const [loading, setLoading] = useState(false);
  //to manage async actions

  const user = useUser();

  useEffect(()=>{
    if(user?.subscriptions.length){
      const current = user.subscriptions.find(subscription=>subscription.subscription===JSON.stringify(userSubscription))
      if(current){
        setPushServerSubscriptionId(current.id)
      }
      console.log('subscription exists')
    }
  }, [user?.subscriptions])
  
  useEffect(() => {
    if (pushNotificationSupported) {
      setLoading(true);
      setError(false);
      // registerServiceWorker().then(() => {
      //   setLoading(false);
      // });
    }
  }, []);
  //if the push notifications are supported, registers the service worker
  //this effect runs only the first render
  
  useEffect(() => {
    setLoading(true);
    setError(false);
    const getExixtingSubscription = async () => {
      const existingSubscription = await getUserSubscription();
      setUserSubscription(existingSubscription);
      setLoading(false);
    };
    getExixtingSubscription();
  }, []);
  //Retrieve if there is any push notification subscription for the registered service worker
  // this use effect runs only in the first render

  /**
   * define a click handler that asks the user permission,
   * it uses the setSuserConsent state, to set the consent of the user
   * If the user denies the consent, an error is created with the setError hook
   */
  const onClickAskUserPermission = async () => {
    setLoading(true);
    setError(false);
    const consent = await askUserPermission()
    setSuserConsent(consent);
    if (consent !== "granted") {
      setError({
        name: "Consent denied",
        message: "You denied the consent to receive notifications",
        code: 0
      });
    }
    setLoading(false);
    return consent
    
  };
  //

  /**
   * define a click handler that creates a push notification subscription.
   * Once the subscription is created, it uses the setUserSubscription hook
   */
  const onClickSusbribeToPushNotification = async () => {
    setLoading(true);
    setError(false);
    try{
    const subscrition = await createNotificationSubscription()
      setUserSubscription(subscrition);
      setLoading(false);
      return subscrition;
    }catch(err:any){
      console.error("Couldn't create the notification subscription", err, "name:", err.name, "message:", err.message, "code:", err.code);
      setError(err);
      setLoading(false);
    };
  };

  /**
   * define a click handler that sends the push susbcribtion to the push server.
   * Once the subscription ics created on the server, it saves the id using the hook setPushServerSubscriptionId
   */
  const onClickSendSubscriptionToPushServer = async () => {
    setLoading(true);
    setError(false);
    try{
    const response = await http.post("/web/subscription", userSubscription)
    
        setPushServerSubscriptionId(response.id);
        setLoading(false);
        return response.id;

    }catch(err:any){
        setLoading(false);
        setError(err);
      };
  };

  const subscribeWebpush = async () => {
    await onClickAskUserPermission()
    await onClickSusbribeToPushNotification()
    await onClickSendSubscriptionToPushServer()
  }


  /**
   * returns all the stuff needed by a Component
   */
  return {
    onClickAskUserPermission,
    onClickSusbribeToPushNotification,
    onClickSendSubscriptionToPushServer,
    subscribeWebpush,
    pushServerSubscriptionId,
    userConsent,
    pushNotificationSupported,
    userSubscription,
    error,
    loading
  };
}