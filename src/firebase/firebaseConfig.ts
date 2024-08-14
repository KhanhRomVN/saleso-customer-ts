import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBC8IacqmdgbIQJkDkZnbiq0nWCbFyyTz0',
  authDomain: 'shopping-image-db.firebaseapp.com',
  projectId: 'shopping-image-db',
  storageBucket: 'shopping-image-db.appspot.com',
  messagingSenderId: '1067007548835',
  appId: '1:1067007548835:web:8f039334c788535868ce16',
  measurementId: 'G-ZX15DZXJQR',
}

const app = initializeApp(firebaseConfig)
export const imageDB = getStorage(app)
