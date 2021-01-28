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

import { defineComponent, PropType, ref, onMounted, computed, Ref, watch, toRefs } from 'vue';
    
import * as d3 from "d3";

import { Axis } from '../utilities/d3/Axis';
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
        transformy : {
            type: String as PropType<t.transform>,
            default: "none" as t.transform
        },
        height: {
            type: Number as PropType<number>,
            default:500
        },
        width: {
            type: Number as PropType<number>,
            default:500
        },
    },
    setup(props){
        const svgRoot: Ref<SVGSVGElement|null> = ref(null);
        // Getting props (reactive) references
        const { data, transformy } = toRefs(props)

        const erase = () => d3.select(svgRoot.value).selectAll('*').remove();
 
        const draw = (data: t.plotData, yTransform: t.transform=transformy.value) => {
            console.log("Drawing&Erasing");
            erase();
            const pointList: t.Points[] = data.x.map((e, i) => ({
                x:e, 
                y: yTransform == '-log10' ? (-1)*Math.log10(data.y[i])
                                          : yTransform == 'log10'  ? Math.log10(data.y[i])
                                          : data.y[i] // aka 'none'
                }) );
            console.log("Creating ActiveLayers");
            const layerUI = new ActiveLayers(svgRoot.value as SVGSVGElement);

            console.log(`Creating Axis for ${yTransform}`);            
            const axis = new Axis(svgRoot.value as SVGSVGElement,
                                  props.height, props.width,
                                  yTransform != "none" ? yTransform : undefined );
            console.log("Drawing Axis");            
            const p: t.Points[] = axis.draw(pointList, 
                                            props.data.xLabel, props.data.yLabel
                                        );
            layerUI.activeArea = axis.getActiveCorners();

            console.log("Creating Plot");            
            const ploter = new VolcanoPlot(svgRoot.value as SVGSVGElement,
                                  axis.xScale,
                                  axis.yScale,
                                  axis.frame,
                                  axis.gX,
                                  axis.gY);            
            console.log("Drawing Plot");                        
            ploter.draw(p);
            
            console.log("Creating Sliders");                        
            const sliderUI = new Sliders(svgRoot.value as SVGSVGElement, 
                                         axis.getActiveCorners(), 
                                         axis.marginBot.marginOuter);            
            console.log("Drawing Sliders");                        
            sliderUI.draw();
            
            // Adding/Resizing Layers Logic
            axis.onActiveBackgroundClick( (x, y)=> layerUI.toggle(sliderUI, x, y) );
            sliderUI.onSlide(() => layerUI.resize(sliderUI) );

        /* Trying zooming stuff  TO BE CONTINUED 
            https://observablehq.com/@d3/zoomable-scatterplot
            http://bl.ocks.org/stepheneb/1182434
        */

        /*
            const k = Number.parseInt(d3.select(svgRoot.value).attr('height')) / Number.parseInt(d3.select(svgRoot.value).attr('width'));
            const xAxis = (g: any, x: any) =>  {
                if (svgRoot.value) 
                    g.attr("transform", `translate(0,${d3.select(svgRoot.value).attr('height')})`)
                .call(d3.axisTop(x).ticks(12))
            };
            const yAxis = (g: any, y: any) => g.call(d3.axisRight(y).ticks(12 * k))
            .call((g: any) => g.select(".domain").attr("display", "none"));

            function zoomed(e: any) {
                const zx = e.transform.rescaleX(axis.xScale).interpolate(d3.interpolateRound);
                const zy = e.transform.rescaleY(axis.yScale).interpolate(d3.interpolateRound);
                d3.select(svgRoot.value).selectAll('circle')
                    .attr("transform", e.transform).attr("stroke-width", 5 / e.transform.k);
                axis.gX?.call(xAxis, zx);
                axis.gY?.call(yAxis, zy);
               // gGrid.call(grid, zx, zy);
            }
             const zoom = d3.zoom()
                .scaleExtent([1, 32])
                .on("zoom", zoomed);
             d3.select(svgRoot.value).call(zoom as any).call(zoom.transform as any, d3.zoomIdentity);
        */
        /* ---------------- */
        };
        watch( (props.data), (newData, oldData) =>{
            console.log("Data changed from");
            console.dir(oldData);
            console.log("to");
            console.dir(newData);
            draw(newData, transformy.value);
            setTimeout(()=>{ console.log("Changing transform");
                              draw(newData, "-log10");}
                            , 2500);
        });
        watch( (transformy), (newTransform, oldTransform) =>{
            console.log("transform changed from");
            console.dir(newTransform);
            console.log("to");
            console.dir(oldTransform);
            draw(data.value, newTransform);
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