
import * as d3 from "d3";
import { Sliders } from './Sliders';
import VolcanoPlot from './VolcanoPlot';

type RectSel = d3.Selection<SVGRectElement, number, SVGGElement, unknown>
export default class ActiveLayers {
    svg: SVGSVGElement;
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
        .attr('fill', 'teal')
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
                found =true;
                return true;
            }
            return false;
        } );

        return sel;
    }
    update(sliderUI: Sliders, x: number, y: number) {
        console.log("resizing layers");
        console.log(x,y);
        const newRect = this.getAvailableRec();
        newRect.attr('width', 200).attr('visibility', 'visible');
    
       
        const xLimSl = sliderUI.xLimits;
        const yLimSl = sliderUI.yLimits;
    

        let x1 = 0,
            x2 = Number.parseInt( d3.select(this.svg).attr('width') ),
            y1 = 0,
            y2 = Number.parseInt( d3.select(this.svg).attr('height') );
        // browse xlim and find smaller than negative -> x0
        //                              positive ->
        
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
    }
}