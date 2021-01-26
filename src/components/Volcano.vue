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

import { PlotFrame, Axis } from '../utilities/d3/Axis';
import VolcanoPlot from '../utilities/d3/VolcanoPlot';
import { Sliders } from '../utilities/d3/Sliders';
import ActiveLayers from '../utilities/d3/ActiveLayers';
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
    /**
     * PAn & Zoom + axis rescale
     * http://bl.ocks.org/stepheneb/1182434
     */
    setup(props){
        const svgRoot: Ref<SVGSVGElement|null> = ref(null);

        const draw = (data: t.plotData) => {
            console.log("Drawing");
            console.log(data);
            const pointList: t.Points[] = data.x.map((e, i) => ({x:e, y:data.y[i]}) );

            const layerUI = new ActiveLayers(svgRoot.value as SVGSVGElement);

            const axis = new Axis(svgRoot.value as SVGSVGElement,
                                  props.height, props.height);
            const p: t.Points[] = axis.draw(pointList, 
                                            props.data.xLabel, props.data.yLabel
                                        );
            layerUI.plotFrame = axis;
   
            const ploter = new VolcanoPlot(svgRoot.value as SVGSVGElement,
                                  axis.xScale,
                                  axis.yScale,
                                  axis.frame,
                                  axis.gX,
                                  axis.gY);
            ploter.draw(p);
            const sliderUI = new Sliders(axis);
            sliderUI.draw();
            
            // Adding/Resizing Layer Logic
            axis.onActiveBackgroundClick( (x, y)=> layerUI.toggle(sliderUI, x, y) );
            sliderUI.onSlide(() => layerUI.resize(sliderUI) );

        };
        watch( (props.data), (newData, oldData) =>{
            console.log("Data changed from");
            console.dir(oldData);
            console.log("to");
            console.dir(newData);
            draw(newData);
        });
        onMounted(() => {
        // the DOM element will be assigned to the ref after initial render
        //console.log(svgRoot.value) // <div>This is a root element</div>
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