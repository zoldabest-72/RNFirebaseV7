import messaging from '@react-native-firebase/messaging';
import { not } from 'ip';
import { Platform } from 'react-native';

class FCMService{
    register = (onRegiter, onNotification, onOpenNotification) => {
        this.checkPermission(onRegiter);
        this.createNotificationListeners(onRegiter, onNotification, onOpenNotification);
    }
     
    registerAppWithFCM = async() => {
        if(Platform.OS === 'ios'){
            await messaging().registerDeviceForRemoteMessages();
            await messaging().setAutoInitEnabled(true);
        }
    }
    
    checkPermission = (onRegiter) => {
        messaging().hasPermission()
        .then(enabled =>{
            if (enabled){
                this.getToken(onRegister);
            }
            else {
                this.requestPermission(onRegiter);
            }
        }).catch(error => {
            console.log("[FCMService] Permission rejected ", error);
        })
    }

    getToken = (onRegister) => {
        messaging().getToken()
        .then(fcmToken => {
            if(fcmToken){
                onRegister(fcmToken);
            }
            else {
                console.log("[FCMService] User doesn't have a device token");
            }
        }).catch(error => {
            console.log("[FCMService] Get token rejected ", error);
        })

    }

    requestPermission = (onRegister) => {
        messaging().requestPermission()
        .then(()=>{
            this.getToken(onRegister);
        }).catch(error => {
            console.log("[FCMService] Request Permission rejected ", error);
        })
    }
    
    deleteToken = () => {
        console.log("[FCMService] Delete Token ");
        messaging().deleteToken()
        .catch(error => {
            console.log("[FCMService] Delete Token error ", error);
        })
    }

    createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
        //When the application is running, but in the background
        messaging()
        .onNotificationOpenedApp(remoteMessage => {
            console.log("[FCMService] onNotificationOpenedApp Notification caused app to open");
            if(remoteMessage) {
                const notification = remoteMessage.notification;
                onOpenNotification(notification);
            }
        })

        //When the application is opened from a quit state.
        messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            console.log("[FCMService] getInitialNotification Notification caused app to open")
            if(remoteMessage){
                const notification = remoteMessage.notification;
                onOpenNotification(notification);
            }
        })

        //Foreground state messages
        this.messageListener = messaging().onMessage(async remoteMessage => {
            console.log("[FCMService] A new FCM message arrived!" , remoteMessage);
            if(remoteMessage) {
                let notification = null;
                if(Platform.OS === 'ios'){
                    notification = remoteMessage.data.notification;
                }
                else {
                    notification = remoteMessage.notification;
                }
                onNotification(notification);
            }
        })

        //Triggerd when have new token
        messaging().onTokenRefresh(fcmToken => {
            console.log("[FCMService] New token refresh: ", fcmToken);
            onRegister(fcmToken);
        })
    }

    unRegiter = () => {
        this.messageListener();
    }
}

export const fcmService = new FCMService();