import {
  ApplicationConfig,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  getFirestore,
  persistentLocalCache,
  provideFirestore,
} from '@angular/fire/firestore';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { IMAGE_CONFIG } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCEstX6G_E9ijV32zbMcLpuBgUqyRlgito',
        authDomain: 'seawatch-web.firebaseapp.com',
        projectId: 'seawatch-web',
        storageBucket: 'seawatch-web.firebasestorage.app',
        messagingSenderId: '772755499356',
        appId: '1:772755499356:web:7decfd4434f5bd1b3db999',
        measurementId: 'G-GEEQE94NK1',
      })
    ),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (isDevMode()) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }

      enableIndexedDbPersistence(firestore)
        .then(() => console.log('Persistence enabled!'))
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            console.warn('Persistence is not available in this browser.');
          }
        });

      return firestore;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (isDevMode()) {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
