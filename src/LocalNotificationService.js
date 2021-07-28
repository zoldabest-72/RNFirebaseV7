import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from "react-native";

class LocalNotificationService {
    configure = (onOpenNotification) => {
        // Must be outside of any component LifeCycle (such as `componentDidMount`).
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log("[LocalNotificationService] onRegister:", token);
            },

            // (required) Called when a remote is received or opened, or local notification is opened
            onNotification: function (notification) {
                console.log("[LocalNotificationService] onNotification:", notification);

                // process the notification
                if (!notification?.data) {
                    return;
                }
                notification.userInteraction = true;
                onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data);
                // // (required) Called when a remote is received or opened, or local notification is opened

                // Only call callback if not from foreground
                if (Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData);
                }
            },

            // // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
            // onAction: function (notification) {
            //     console.log("ACTION:", notification.action);
            //     console.log("NOTIFICATION:", notification);

            //     // process the action
            // },

            // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
            // onRegistrationError: function (err) {
            //     console.error(err.message, err);
            // },

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             * - if you are not using remote notification or do not have Firebase installed, use this:
             *     requestPermissions: Platform.OS === 'ios'
             */
            requestPermissions: true,
        });
    }

    unRegister = () => {
        PushNotification.unregister();
    }

    showNotification = (id, title, message, data = {}, options = {}) => {
        PushNotification.localNotification({
            //Android Only Properties
            ...this.buildAndroidNotification(id, title, message, data, options),
            //Ios and android properties
            ...this.buildIOSNotification(id, title, message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || false,
            userInteraction: false
        })
    }

    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        return {
            id: id,
            autoCancel: true,
            largeIcon: options.largeIcon || "ic_launcher",
            smallIcon: options.smallIcon || "ic_notification",
            bigText: message || "",
            subText: title || "",
            vibrate: options.vibrate || true,
            vibration: options.vibrate || true,
            priority: options.priority || "high",
            importance: options.importance || "high",
            data: data,
        }
    }

    buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        return {
            alertAction: options.alertAction || "view",
            category: options.category || "",
            userInfo: {
                id: id,
                item: data,
            }
        }
    }

    cancelAllocationNotifications = () => {
        if(Platform.OS === 'ios'){
            PushNotificationIOS.removeAllDeliveredNotifications();
        }
        else {
            PushNotification.cancelAllLocalNotifications();
        }
    }

    removeDeliveredNotificationByID = (notificationId) => {
        console.log("[LocalNotificationService] removeDeliveredNotificationByID: ", notificationId);
        PushNotification.cancelAllLocalNotifications({id: `${notificationId}`});
    }
}

export const localNotificationService = new LocalNotificationService();