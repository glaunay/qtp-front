<template>
  <input
  type="range"
    :min="yMin" :max="yMax" 
    :value="yValue" 
    :step="yStep" 
    class="vertSlider" 
    id="sigRange" 
    orient="vertical">
    <p>Significance Threshold: <span id="sigValue"></span></p>
    <input type="range" :min="xLowMin" :max="xLowMin" :value="xLowValue" :step="xLowStep"  class="horizSlider" id="foldLRange" orient="horizontal">
    <input type="range" :min="xUpMin"  :max="xUpMax"  :value="xUpValue"  :step="xUpStep"   class="horizSlider" id="foldRRange" orient="horizontal">
    <p>Left Fold Change Threshold: <span id="foldLValue"></span> | Right Fold Change Threshold: <span id="foldRValue"></span></p>    
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
    props:{
        yMin :{
            default:0,
            type:Number
        },
        yMax :{
            default:8,
            type:Number
        },
        yValue : {
            default:1.3,
            type:Number
        },
        yStep : {
            default:0.1,
            type:Number
        },

        xLowMin :{
            default:-4,
            type:Number
        },
        xLowMax :{
            default:0,
            type:Number
        },
        xLowValue : {
            default:-2,
            type:Number
        },
        xLowStep : {
            default:0.1,
            type:Number
        },

        xUpMin :{
            default:0,
            type:Number
        },
        xUpMax :{
            default:2,
            type:Number
        },
        xUpValue : {
            default:0.8,
            type:Number
        },
        xUpStep : {
            default:0.1,
            type:Number
        },

    }
})
</script>

<style scoped>
.slidecontainer {
  width: 1%;
}

.vertSlider {
  -webkit-appearance: slider-vertical;
  width: 5%;
  height: 500 px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.vertSlider:hover {
  opacity: 1;
}

.horizSlider {
  width: 17%;
  height: 10px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.horizSlider:hover {
  opacity: 1;
}

</style>