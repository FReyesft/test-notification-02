import { Component, OnInit, NgZone  } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from "@capacitor-community/fcm";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Storage } from '@ionic/storage-angular';
import 'firebase/storage'

interface PushNotificationToken {
  value: string;
}

interface PushNotification {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  badge?: number;
  notification?: any;
  data: any;
  click_action?: string;
  link?: string; //Esta propiedad se puede usar para saber a que pagina redirigir al usuario//
}

interface PushNotificationActionPerformed {
  actionId: string; //Identificador de la acción que se desea realizar 
  inputValue?: string; // hace referencia a la accíon par la cual se ha abierto la aplicación
  notification: PushNotification; // Hace referencia a el tipo pushnotification
}

interface PushNotificationDeliveredList {
  notifications: Array<PushNotification>;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent implements OnInit{
  notificationPush: PushNotification;
  notificationPerformed: PushNotificationActionPerformed;
  token: string;
  notifications: PushNotification[];
  topic: string = 'perros'
  constructor(private ngZone: NgZone, private storage:Storage) {
  }

  ngOnInit(): void {
    PushNotifications.requestPermissions().then((response) => {
      PushNotifications.register().then(() => {
        alert('Registered for push');
      });
    });
    PushNotifications.addListener('registration', (token) => {
      alert(JSON.stringify(token));
    })
    PushNotifications.addListener('pushNotificationReceived', (response) => {
      this.ngZone.run(() => {
        this.notifications.unshift(response)
      })
      alert(`Notificación: ${JSON.stringify(response)}`);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (response) => {
      this.ngZone.run(() => {
        this.notifications.unshift(response.notification)
      })
    })
  }


  subscribeToTopic() {
    PushNotifications.register().then(() => {
      FCM.subscribeTo({ topic: this.topic})
        .then((r) => alert(`Subcribed to topic: ${this.topic}`))
        .catch((error) => alert(`Ha ocurrido un error: ${error}`));
    }).catch((error) => alert(`Ha ocurrido un error: ${error}`));
  }
  unSubscribeTopic() {
    FCM.unsubscribeFrom({topic: this.topic})
      .then(() => alert(`Te desuscribiste de ${this.topic}`))
      .catch((error) => alert(`Ha ocurrido un error: ${error}`));
  }
  getToken() {
    FCM.getToken()
      .then((result) => {
        this.token = result.token;
      }).catch((error) => alert(`Ha ocurrido un error: ${error}`));
  }
  localNotification() {
    LocalNotifications.schedule({
      notifications: [
        {
          title: '¡Notificación!',
          body: 'Este es el cuerpo de la notificación',
          id: 1,
          schedule: { at: new Date(Date.now() + 5000) }, 
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
          smallIcon: 'ic_launcher', 
          iconColor: '#488AFF' 
        },
      ],
    })
  }
}

