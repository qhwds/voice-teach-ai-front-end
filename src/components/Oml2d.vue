<script setup lang="ts">
import { loadOml2d } from 'oh-my-live2d'
import { ref } from 'vue'
import {onMounted} from 'vue'
const oml2dRef = ref<HTMLElement>()
onMounted(() => {
    const oml2d = loadOml2d({
     parentElement: oml2dRef.value,
     models: [
      {
          path: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',
          scale: 0.12,
          position: [-10, 50],
          stageStyle: {
            width: 350
         }
       }

        
     ]
   })
   oml2d.onStageSlideIn(() => {
    console.log('舞台已完全滑入')
    
   })
})
 

</script>

<script lang="ts">
export default{ name: 'oh-my-live2d'};
</script>

<template>
	<div class="oh-my-live2d" ref="oml2dRef"></div>
</template>
