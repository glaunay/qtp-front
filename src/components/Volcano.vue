<template>

<div>
    <!-- <button @click="test()" class="p-1 border rounded shadow w-15 h-10">TEST</button> -->

<svg ref="svgRoot">
</svg>
</div>

</template>

<script lang="ts">
/*
class VolcanoData {
    x: number[];
    y: number[];
    xLabel:string;

    constructor(x: number[], xLabel:string, )
} 
*/

import { defineComponent, PropType, ref, onMounted, computed, Ref, watch } from 'vue';

import * as d3 from "d3";

import Axis from '../utilities/d3/Axis';
import VolcanoPlot from '../utilities/d3/VolcanoPlot';
import * as t from '../utilities/models/volcano';
/*
This will have to be made reactive in parent .vue
*/
export default defineComponent({

   props: {
        data: {
            type: Object as PropType<t.plotData>,
            default : {
                x:[],
                y:[],
                xLabel:'',
                yLabel:''
            }
        
        },
        height: {
            type: Object as PropType<number>,
            default:500
        },
        width: {
            type: Object as PropType<number>,
            default:500
        },
    },
    setup(props){
        const svgRoot: Ref<SVGSVGElement|null> = ref(null);

        const draw = (data: t.plotData) => {
            console.log("Drawing");
            console.log(data);
            const pointList: t.Points[] = data.x.map((e, i) => ({x:e, y:data.y[i]}) );

            const axis = new Axis(svgRoot.value as SVGSVGElement,
                                  props.height, props.height);
            const p: t.Points[] = axis.draw(pointList, props.data.xLabel, props.data.yLabel);
            /*
            Simpler to set up a whole g "frame" to account for all 
            margin and pass it to the ploter
            */
            
            const ploter = new VolcanoPlot(svgRoot.value as SVGSVGElement,
                                  axis.xScale,
                                  axis.yScale,
                                  axis.gX,
                                  axis.gY);
            ploter.draw(p);
        };
        watch( (props.data), (newData, oldData) =>{
            console.log("Data changed from");
            console.dir(oldData);
            console.log("to");
            console.dir(newData);
            draw(newData);
        });

       
        /*const data = computed( () => props.x.map( (e, i) =>  ({ 'x' : e, 'y' : props.y[i]})) );

        const test = () => {
            console.log("Testing");
            console.log(data);
        };*/

        onMounted(() => {
        // the DOM element will be assigned to the ref after initial render
        console.log(svgRoot.value) // <div>This is a root element</div>
        /*console.log(d3);*/
        console.log(props.height, props.width);
        d3.select(svgRoot.value)
        .attr("height", props.height)
        .attr("width", props.width)
        .attr("class", "volcano-svg-component");
      });

      return {
        svgRoot
      }
    
    
    }



});

</script>

<style scoped>
.volcano-svg-component{
    background-color: AliceBlue;
}
.axis path,
.tick line,
.tick text {
    stroke: #666;
    stroke-width: 0.5px;
    stroke-opacity: 0.5;
}
.label {
    fill: #666;
    font-weight: 700;
    font-size: 12px;
}
</style>