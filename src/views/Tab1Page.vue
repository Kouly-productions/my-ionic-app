<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Quotes</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title class="random_quote" size="large">Random Quote</ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="card-container">
        <ion-card class="ion-margin">
        <ion-card-header>
          <ion-card-title>Shake for a New Quote</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h2>{{ quote }}</h2>
          <p>— {{ author }}</p>
        </ion-card-content>
      </ion-card>
      </div>
      <div class="button-container">
        <ion-button class="save-btn" @click="saveQuote($event)">
          Save this quote
        </ion-button>
      </div>
    </ion-content>
    <ion-alert
      :is-open="showPermissionAlert"
      header="Enable Shake Detection"
      message="This app needs motion permission to detect shake gestures for new quotes. Would you like to enable this feature?"
      :buttons="alertButtons"
      @didDismiss="handleAlertDismiss"
    />
    <ion-toast
      :is-open="showDuplicateToast"
      message="This quote is already saved!"
      :duration="2000"
      position="bottom"
      color="warning"
      @didDismiss="showDuplicateToast = false"
    />
    <ion-toast
      :is-open="showSuccessToast"
      message="Quote saved successfully!"
      :duration="2000"
      position="bottom"
      color="success"
      @didDismiss="showSuccessToast = false"
    />
  </ion-page>
 </template>
 
 <script setup lang="ts">
 import { ref, onMounted, onUnmounted } from 'vue';
 import emitter from '@/eventBus';
 import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonAlert,
  IonToast,
 } from '@ionic/vue';
 
 // Reactive state
 const quote = ref('Loading quote...');
 const author = ref('');
 const showPermissionAlert = ref(false);
 const showDuplicateToast = ref(false);
 const showSuccessToast = ref(false);

 const alertButtons = [
   {
     text: 'Not Now',
     role: 'cancel',
     handler: () => {
       console.log('Permission denied by user');
     }
   },
   {
     text: 'Enable',
     role: 'confirm',
     handler: () => {
       requestMotionPermission();
     }
   }
 ];
 
 // Fetch a quote from the API
 const fetchQuote = async () => {
  console.log('[fetchQuote] Starting to fetch a new quote...');
  try {
    const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
      headers: {
        'X-Api-Key': 'IEB+9fRk7oabGTSM/rtMug==sx7pfEa4DTuL5rpj'
      }
    });
    console.log('[fetchQuote] Response status:', response.status);
    const data = await response.json();
    console.log('[fetchQuote] Data received:', data);
    if (data && data.length > 0) {
      quote.value = data[0].quote;
      author.value = data[0].author;
      console.log('[fetchQuote] Updated quote and author:', quote.value, author.value);
    } else {
      console.log('[fetchQuote] No quote data found');
      quote.value = 'No quote found.';
      author.value = '';
    }
  } catch (error) {
    console.error('[fetchQuote] Error fetching quote:', error);
    quote.value = 'Error fetching quote.';
    author.value = '';
  }
 };
 
 // Shake detection variables
 let lastShakeTime = 0;
 const shakeThreshold = 15;
 
 // Handler for device motion events
 const handleMotionEvent = (event: DeviceMotionEvent) => {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;
  
  const currentTime = Date.now();
  if (currentTime - lastShakeTime < 1000) return;
 
  if (
    (acceleration.x && Math.abs(acceleration.x) > shakeThreshold) ||
    (acceleration.y && Math.abs(acceleration.y) > shakeThreshold) ||
    (acceleration.z && Math.abs(acceleration.z) > shakeThreshold)
  ) {
    lastShakeTime = currentTime;
    fetchQuote();
  }
 };
 
 // Motion listener management
 const addMotionListener = () => {
  window.addEventListener('devicemotion', handleMotionEvent);
  console.log('[addMotionListener] Added devicemotion event listener.');
 };
 
 const removeMotionListener = () => {
  window.removeEventListener('devicemotion', handleMotionEvent);
  console.log('[removeMotionListener] Removed devicemotion event listener.');
 };
 
 // Request motion permission
 const requestMotionPermission = async () => {
  console.log('[requestMotionPermission] Requesting motion permission.');
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const response = await (DeviceMotionEvent as any).requestPermission();
      console.log('[requestMotionPermission] Permission response:', response);
      if (response === 'granted') {
        console.log('[requestMotionPermission] Motion permission granted.');
        addMotionListener();
      } else {
        console.warn('[requestMotionPermission] Motion permission denied.');
      }
    } catch (error) {
      console.error('[requestMotionPermission] Error requesting motion permission:', error);
    }
  } else {
    // Permission is not required on this platform
    console.log('[requestMotionPermission] Motion permission not required.');
    addMotionListener();
  }
 };
 
 const handleAlertDismiss = () => {
   showPermissionAlert.value = false;
 };
 
 onMounted(() => {
  console.log('[onMounted] Component mounted.');
  fetchQuote();
 
  // Check if permission is required (for iOS 13+)
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    // Show the permission alert
    showPermissionAlert.value = true;
  } else {
    // No permission needed, attach listener immediately
    addMotionListener();
  }
 });
 
 onUnmounted(() => {
  console.log('[onUnmounted] Component unmounted. Removing listener.');
  removeMotionListener();
 });
 
 // Save quote functionality
 interface SavedQuote {
   quote: string;
   author: string;
   timestamp: number;
 }
 
 const saveQuote = ($event: MouseEvent) => {
  const button = $event.currentTarget as HTMLElement;
  button.classList.add('bouncy');
  button.addEventListener('animationend', () => {
    button.classList.remove('bouncy');
  }, { once: true });

  const stored = localStorage.getItem('savedQuotes');
  const savedQuotes: SavedQuote[] = stored ? JSON.parse(stored) : [];
  
  if (savedQuotes.find(q => q.quote === quote.value)) {
    console.log('Quote already saved');
    showDuplicateToast.value = true;
    return;
  }
  
  savedQuotes.push({
    quote: quote.value,
    author: author.value,
    timestamp: Date.now(),
  });
  
  localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
  console.log('Quote saved successfully using localStorage.');
  
  showSuccessToast.value = true;
  emitter.emit('quoteSaved');
};

 </script>
 
 <style>
.card-container {
  display: flex;
  width: 100vw;
  justify-content: center;
  align-items: center;
}

ion-content {
  justify-content: center;
  align-items: center;
}

 .button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 1rem;
 }
 
 ion-button {
  width: 70%;
  color: white;
 }

  ion-card {
    width: 95%;
  }

 ion-toolbar {
  text-align: center;
 }
 
 @keyframes bounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.bouncy {
  animation: bounce 0.5s;
}

 </style>