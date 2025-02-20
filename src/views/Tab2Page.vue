<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Saved Quotes</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Saved Quotes</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Show message if no quotes -->
      <div v-if="savedQuotes.length === 0" class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>No saved quotes yet. Go to the first tab to save some quotes!</p>
        </ion-text>
      </div>

      <!-- List of saved quotes -->
      <ion-list v-else>
        <ion-item-sliding v-for="quote in savedQuotes" :key="quote.timestamp">
          <ion-item>
            <ion-label class="ion-text-wrap">
              <h2>{{ quote.quote }}</h2>
              <p>— {{ quote.author }}</p>
              <p class="timestamp">{{ formatDate(quote.timestamp) }}</p>
              <button color="danger" @click="deleteQuote(quote.timestamp)">Delete</button>
            </ion-label>
          </ion-item>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { trashOutline } from 'ionicons/icons';
import { onIonViewDidEnter } from '@ionic/vue';
import emitter from '@/eventBus';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonIcon,
  IonText
} from '@ionic/vue';

interface SavedQuote {
  quote: string;
  author: string;
  timestamp: number;
}

const savedQuotes = ref<SavedQuote[]>([]);

// Load saved quotes from localStorage
const loadSavedQuotes = () => {
  const stored = localStorage.getItem('savedQuotes');
  if (stored) {
    savedQuotes.value = JSON.parse(stored);
    // Sort quotes by newest first
    savedQuotes.value.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    savedQuotes.value = [];
  }
};

onIonViewDidEnter(() => {
  loadSavedQuotes();
});

// Delete a quote and update localStorage
const deleteQuote = (timestamp: number) => {
  savedQuotes.value = savedQuotes.value.filter(q => q.timestamp !== timestamp);
  localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes.value));
};

// Format timestamp to a readable date string
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Load quotes when component mounts
onMounted(() => {
  loadSavedQuotes();

  // Listen for the 'quoteSaved' event and reload the quotes.
  emitter.on('quoteSaved', loadSavedQuotes);
});

onUnmounted(() => {
  emitter.off('quoteSaved', loadSavedQuotes);
});
</script>

<style scoped>
.timestamp {
  font-size: 0.8em;
  color: var(--ion-color-medium);
  margin-top: 8px;
}

ion-item h2 {
  font-size: 1.1em;
  margin-bottom: 8px;
}

ion-item p {
  margin: 4px 0;
}

button {
  height: 50px;
  width: 30%;
  background-color: red;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 5px;
  margin-top: 8px;
}
</style>
