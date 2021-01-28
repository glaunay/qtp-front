
import * as d3 from "d3";
import { Sliders, axType, axNum } from './Sliders';
import VolcanoPlot from './VolcanoPlot';
import { ActiveCorners } from './Axis';
import { axisRight } from "d3";
import { defineAsyncComponent, registerRuntimeCompiler } from "vue";

type RectSel = d3.Selection<SVGRectElement, number, SVGGElement, unknown>
export default class ActiveLayers {
    svg: SVGSVGElement;
    activeArea?: ActiveCorners;
    recPool: RectSel;
    constructor(svg: SVGSVGElement) {
        this.svg = svg;
        console.log(svg);
        console.dir(d3.select(this.svg));
        this.recPool = d3.select(this.svg).append('g')
        .attr('class', 'active-layers')
        .selectAll('rect')
        .data([1,2,3,4,5,6])
        .enter()
        .append('rect')
        .attr('x', (d,i)=>50 * i)
        .attr('y', 50)
        .attr('width', 50)
        .attr('height', 50)
        .attr('fill', 'khaki')
        .attr('visibility', 'hidden')
        .on('click', function(e){
            d3.select(this).attr('visibility', 'hidden');
            e.stopPropagation();
            console.log("Click on rect");
        });
    }
    getAvailableRec(): RectSel{
        let found = false;
        const sel = this.recPool.filter( function(d){
            if (found)
                return false;
            if (d3.select(this).attr('visibility') == 'hidden') {
                found = true;
                return true;
            }
            return false;
        } );

        return sel;
    }
    resize(sliderUI: Sliders){
        if(! this.activeArea)
            throw('Missing a plot corners to resize active layer');
            const frame: ActiveCorners = this.activeArea;
         /*
            x1 : this.plotFrame.marginLeft,
            x2 : Number.parseInt( d3.select(this.svg).attr('width') ) - this.plotFrame.marginRight,
            y1 : this.plotFrame.marginTop,
            y2 : Number.parseInt( d3.select(this.svg).attr('height') ) - this.plotFrame.marginBot
        };*/

        console.log("RESIZING LOGIC");
        const xLimSl = sliderUI.xLimits;
        const yLimSl = sliderUI.yLimits;
        console.log(sliderUI.currentAxType, sliderUI.currentAxNum);
        this.recPool.each(function(d) {            
            if (d3.select(this).attr('visibility') == 'hidden')
                return;
            const x  = Number.parseInt( d3.select(this).attr('x') );
            const y  = Number.parseInt( d3.select(this).attr('y') );
            const x2 = Number.parseInt( d3.select(this).attr('x2') );
            const y2 = Number.parseInt( d3.select(this).attr('y2') );
            console.log(`Current layer ${x},${y}:${x2},${y2}`);      
            console.log(`---${sliderUI.currentAxType}`);
            console.log(`xlimSl ${xLimSl}`);
            console.dir(`ylimSl ${yLimSl}`);
            
            // Y slider changing everyone is affected
            if(sliderUI.currentAxType == 'right') {
                if(y == frame.y1) {
                    console.log('top_Y is constant stretching bot ')
                    d3.select(this).attr('y2', yLimSl[0])
                                   .attr('height', yLimSl[0] - frame.y1);
                }
                else if(y2 == frame.y2) {
                    console.log('bot_Y is constant stretching top ')
                    d3.select(this).attr('y', yLimSl[0])
                                   .attr('height', frame.y2 - yLimSl[0]);
                }
            }
            else if(sliderUI.currentAxType == 'bottom') {
                console.log(`Bottom slider, current active count ${sliderUI.currentAxNum}`);
                if(sliderUI.currentAxNum == 1 &&
                    x2 == frame.x2) {
                    console.log('Right Layer(s) to mod');
                    console.log(xLimSl);
                    d3.select(this).attr('x', xLimSl[0])
                    .attr('width', frame.x2 - xLimSl[0]);                    
                }
                else if(sliderUI.currentAxNum == 2 &&
                    x == frame.x1) {
                    console.log('Left Layer(s) to mod');
                    console.log(xLimSl);
                    d3.select(this).attr('x2', xLimSl[1])
                    .attr('width', xLimSl[1] - frame.x1);                    
                }
                else if( x  != frame.x1 && 
                         x2 != frame.x2 ) { 
                    console.log('Middle Layer(s) to mod');
                    console.log(xLimSl);
                    d3.select(this).attr('x', xLimSl[1])
                    .attr('x2', xLimSl[0])
                    .attr('width', xLimSl[0] - xLimSl[1]);       
                }
            }
        });
    }
    toggle(sliderUI: Sliders, x: number, y: number) {
        if(! this.activeArea)
        throw('Missing a plot corners to resize active layer');
        const frame: ActiveCorners = this.activeArea;
        console.log("adding layers");    
        const xLimSl = sliderUI.xLimits;
        const yLimSl = sliderUI.yLimits;

        console.log("DRAWING LOGIC");
        console.log(x,y);
    
        // Upper-left, bottom-right corners of data projection area
        /*
        let x1 = axis.marginLeft,
            x2 = Number.parseInt( d3.select(this.svg).attr('width') ) - axis.marginRight,
            y1 = axis.marginTop,
            y2 = Number.parseInt( d3.select(this.svg).attr('height') ) - axis.marginBot;
        */

        // browse xlim and find smaller than negative -> x0
        //                              positive ->
        
        let {x1, y1, x2, y2} = frame;
        console.log(`Starting ${x1},${y1}:${x2},${y2}`) 
        console.log(`Ping at ${x} ${y}`);
        console.log(typeof(x));
        console.log(sliderUI.xLimits);
        console.log(sliderUI.yLimits);
        
        const xLeft = Math.min(...xLimSl)
        const xRight = Math.max(...xLimSl)
        //const xSolo = xLimSl.length == 1;
        const yLim = yLimSl[0];
        if (y >= yLim) {
            console.log(`Shifting borne inf ${y} >= ${yLim}`);
            y1 = yLim;
        } else if (y < yLim) {
            console.log("Shifting borne sup")
            y2 = yLim;
        } 

        if (x >= xRight) {
            x1 = xRight;
        } else if (x < xLeft) {
            x2 = xLeft
        } else { // We got between 2 sliders
            console.log("Btwn sliders");
            x1 = xLeft;
            x2 = xRight;
        }

        console.log(`Painting ${x1},${y1}:${x2},${y2}`);
        const xRec = x1;
        const yRec = y1;
        const width = x2 - x1;
        const height = y2 - y1;

        const newRect = this.getAvailableRec();
        newRect.attr('x', xRec)
        .attr('y', yRec)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('width', width)
        .attr('height', height)
        .attr('visibility', 'visible');
       
    } 
}