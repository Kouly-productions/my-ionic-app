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
         <ion-title size="large">Random Quote</ion-title>
       </ion-toolbar>
     </ion-header>
     <ion-card class="ion-margin">
       <ion-card-header>
         <ion-card-title>Shake for a New Quote</ion-card-title>
       </ion-card-header>
       <ion-card-content>
         <h2>{{ quote }}</h2>
         <p>— {{ author }}</p>
       </ion-card-content>
     </ion-card>
     
     <div class="button-container">
       <ion-button v-if="needsPermission" @click="requestMotionPermission">
         Enable Shake Detection
       </ion-button>
       <ion-button class="save-btn">
         Save this quote
       </ion-button>
     </div>
   </ion-content>
 </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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
 IonButton
} from '@ionic/vue';

// Reactive state for the quote and author.
const quote = ref('Loading quote...');
const author = ref('');

// Controls whether we need to request motion permission (e.g. on iOS).
const needsPermission = ref(false);

// Fetch a quote from the API.
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

// Shake detection variables.
let lastShakeTime = 0;
const shakeThreshold = 15; // Adjust threshold as needed

// Handler for device motion events.
const handleMotionEvent = (event: DeviceMotionEvent) => {
 const acceleration = event.accelerationIncludingGravity;
 console.log('[handleMotionEvent] Motion event detected, acceleration:', acceleration);
 
 if (!acceleration) {
   console.log('[handleMotionEvent] No acceleration data available.');
   return;
 }
 
 const currentTime = Date.now();
 // Throttle: only process one shake per second.
 if (currentTime - lastShakeTime < 1000) {
   console.log('[handleMotionEvent] Shake event throttled.');
   return;
 }

 if (
   (acceleration.x && Math.abs(acceleration.x) > shakeThreshold) ||
   (acceleration.y && Math.abs(acceleration.y) > shakeThreshold) ||
   (acceleration.z && Math.abs(acceleration.z) > shakeThreshold)
 ) {
   console.log('[handleMotionEvent] Shake detected!', { x: acceleration.x, y: acceleration.y, z: acceleration.z });
   lastShakeTime = currentTime;
   fetchQuote();
 }
};

// Attach and detach the devicemotion event listener.
const addMotionListener = () => {
 window.addEventListener('devicemotion', handleMotionEvent);
 console.log('[addMotionListener] Added devicemotion event listener.');
};

const removeMotionListener = () => {
 window.removeEventListener('devicemotion', handleMotionEvent);
 console.log('[removeMotionListener] Removed devicemotion event listener.');
};

// Request motion permission if required (e.g. on iOS 13+).
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
       needsPermission.value = false;
       addMotionListener();
     } else {
       console.warn('[requestMotionPermission] Motion permission denied.');
     }
   } catch (error) {
     console.error('[requestMotionPermission] Error requesting motion permission:', error);
   }
 } else {
   // Permission is not required on this platform.
   console.log('[requestMotionPermission] Motion permission not required.');
   needsPermission.value = false;
   addMotionListener();
 }
};

onMounted(() => {
 console.log('[onMounted] Component mounted.');
 fetchQuote();

 // Check if permission is required (for example, on iOS 13+).
 if (
   typeof DeviceMotionEvent !== 'undefined' &&
   typeof (DeviceMotionEvent as any).requestPermission === 'function'
 ) {
   needsPermission.value = true;
   console.log('[onMounted] DeviceMotion permission is required. Waiting for user gesture.');
 } else {
   // No permission needed, attach listener immediately.
   addMotionListener();
 }
});

onUnmounted(() => {
 console.log('[onUnmounted] Component unmounted. Removing listener.');
 removeMotionListener();
});

</script>

<style>
.save-btn {
 --color: white;
}

.button-container {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 10px;
 margin: 1rem;
}

ion-button {
 width: 200px;
}
</style>