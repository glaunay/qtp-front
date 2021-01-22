<template>

    <h1>This is Volcanoes!!</h1>
    Choose data records 
    <button v-if="canDraw"
    class="p-1 rounded bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
    @click="draw()"
    >PLOT IT</button>
    <div v-if="selectable" class="overflow-y-scroll max-h-14 bg-gray-300">
      <div 
      v-for="column in availableData" 
      :key="column" 
      v-text="column"
      @click="select(column)"
      :class="{ active: isSelected(column) }"
      ></div>
    </div>
  <!--
    <label class="block">
      <span class="text-gray-700">Select</span>
      <select class="form-select block w-full mt-1">
        <option v-for="column in availableData" :key="column" v-text="column"></option>
      </select> 
      </label>
    </div>
    -->
    <Sliders/>
   <!--  <Volcano :x="[5,3]" :y="[9,1]"/> -->
    <!-- <button @click="test()" class="p-1 border rounded shadow w-15 h-10">TEST</button>-->
    <div class="p-2">
     <Volcano :data="plotData"/>
    <!-- <Volcano height=500 width=500/> -->
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref, reactive } from 'vue';
import { useStore, mapGetters } from 'vuex'
import Sliders from '@/components/Sliders.vue';
import Volcano from '@/components/Volcano.vue';
import { plotData  as plotDataType } from '../utilities/models/volcano';
import { toggle } from '../utilities/Arrays';
export default defineComponent({


  components: { Sliders, Volcano },

  setup() {
    const store = useStore();


    const plotData = reactive({
      x: new Array<number>(),
      y: new Array<number>(),
      xLabel:'',
      yLabel:''
    } as plotDataType);

    const selectable = computed( () => store.getters.getActiveSheet != null );
    const selected = ref(new Array<string>());
    const select = (field: string) => {
          const _ = toggle(selected.value, field);
          selected.value = _.length <= 2 ? _ : _.slice(-2) ;
        };
    const isSelected = (field: string) => selected.value.includes(field);

    const availableData = computed( () => store.getters.currentSheetHeaders);

    const canDraw = computed(() => selected.value.length === 2);
    const draw = () => {
      if(canDraw.value) {
        console.log("lets draw");
        console.log(canDraw.value);

        plotData.x = store.getters.getColDataByName(selected.value[0], 'number');
        plotData.y = store.getters.getColDataByName(selected.value[1], 'number');    
        plotData.xLabel = selected.value[0];
        plotData.yLabel = selected.value[1];

      }
    }
    return {canDraw, draw, availableData, selectable, selected, select, isSelected, plotData};
  }


})
</script>

<style>
.active {
  background-color : orange;
}
</style>