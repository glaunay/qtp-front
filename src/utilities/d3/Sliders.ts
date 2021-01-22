import * as d3 from "d3";
import Axis from "./Axis";

type axType = 'bottom'| 'right';
type axNum  = 1 | 2;
type GSel =  d3.Selection<SVGGElement, unknown, null, undefined>;
export default class Sliders {
    svg: SVGSVGElement;

    constructor(svg: SVGSVGElement){
        this.svg = svg;
    }
    private drawHandler(axis: axType, count: axNum) {
        const size = 300;
       
        const h = Number.parseInt(d3.select(this.svg).style("height")),
              w = Number.parseInt(d3.select(this.svg).style("width"));
        
        
        let xOffset: number, xLowerOffset: number|undefined,
            yOffset: number, yLowerOffset: number|undefined;
        
        if(axis == 'bottom') {
            xOffset = w /2;
            yOffset = h;
            if(count == 2) {
                xOffset = 3/4 * w;
                xLowerOffset = 1/4 * w;
            }
        }
        else if(axis == 'right') {
            yOffset = h /2;
            xOffset = w;
            if(count == 2) {
                yOffset = 3/4 * h;
                yLowerOffset = 1/4 * h;
            }
        }

        interface Sliders {
            handlers: GSel[];
            ghosts: GSel[];
        }
        
        const sliders:Sliders = { handlers : [], ghosts : [] };

        const generateHandlerG = (size: number) => {
            const g = d3.select(this.svg).append('g').attr('class', 'symbol');
            const symbol = d3.symbol().type(d3.symbolTriangle).size(size);
            const handler = g.append('path')
            .attr('id', 'symbol')
            .attr('d', symbol)
            g.append('line')
            .attr('x1', axis == "bottom" ? 0 : 0  )
            .attr('x2',0)
            .attr('y1', -1 * h)//-1 * xOffset) 
            .attr('y2', 0)
            .attr("stroke", "gray")
            .attr('stroke-dasharray', "10,10")
            .attr('stroke-width', 2);
            g.attr('transform', `translate(${xOffset}, ${h})`);
            return g;
        }

        for (let i = 0 ; i < count ; i++) {
            const gSlider = generateHandlerG(size);
            gSlider.attr('class', 'handler')
            .attr('fill', 'gray');

            const gGhost = generateHandlerG(size);
            gGhost.attr('class', 'handler-ghost')
            .attr('fill', 'gray')
            .attr('visibility', 'hidden');
            const D = d3.drag()
                .on("start", (event, d) => {
                    gSlider.attr('stroke-width', 4).attr("stroke", "lime");
                    gGhost.attr('visibility', 'visible');
                })
                .on("drag", (event, d: any) => {      
                    xOffset = event.x;
                    gSlider.attr('transform', `translate(${xOffset},${h})`);
                })  
                .on("end", (event, d) => {
                    gSlider.attr('stroke-width', 1).attr("stroke", "black");
                    gGhost.attr('visibility', 'hidden');
                    gGhost.attr('transform', gSlider.attr('transform'));
                }); // Could not fathom the proper types
            gSlider.call(D as any); 
            sliders.handlers.push(gSlider);
            sliders.ghosts.push(gGhost);
        }
        console.dir(sliders);
    }
    
    //https://observablehq.com/@d3/d3v6-migration-guide#event_drag
    draw(){
       this.drawHandler("bottom", 1);
       //this.drawHandler("bottom", "right");
    }
        
}
