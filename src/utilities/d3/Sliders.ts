import * as d3 from "d3";
import Axis from "./Axis";

type axType = 'bottom'| 'right';
type axNum  = 1 | 2;
type GSel =  d3.Selection<SVGGElement, unknown, null, undefined>;

export interface SlidersI {
    handlers: GSel[];
    ghosts: GSel[];
}

export class Sliders {
    svg: SVGSVGElement;
    specsBot: SlidersI = { handlers : [], ghosts : [] };
    specsRight: SlidersI = { handlers : [], ghosts : [] };
    private re = /translate\([\s]*([\d]+),[\s]*([\d]+)\)/;
    public get xLimits(): number[] {
        return this.specsBot.handlers.map((g)=>{
            const _ = g.attr('transform');
            const h = this.re.exec(_);
            if(h != undefined)
                return Number.parseInt(h[1]);
            else
                throw("Cant parse slide xlimit");
        });
    }
    public get yLimits(): number[] {
        return this.specsRight.handlers.map((g)=>{
            const _ = g.attr('transform');
            const h = this.re.exec(_);
            if(h != undefined)
                return Number.parseInt(h[2]);
            else
                throw("Cant parse slide ylimit");
        });
    }
    constructor(svg: SVGSVGElement){
        this.svg = svg;

    }

    private drawHandler(axis: axType, count: axNum) {
        const size = 300;
       
        const h = Number.parseInt(d3.select(this.svg).style("height")),
              w = Number.parseInt(d3.select(this.svg).style("width"));
        
        
        let slCoor: number, slCoorLow: number|undefined;
        
        slCoor    = (count == 2 ? 3/4 : 1/2) * (axis == 'bottom' ? w : h);
        slCoorLow = count == 2 ? 1/4 * (axis == 'bottom' ? w : h) : undefined;        

   
        
        //const sliders: SlidersI = { handlers : [], ghosts : [] };
        const sliders = axis == 'bottom' ? this.specsBot : this.specsRight;
        const generateHandlerG = (size: number, initCoor: number) => {
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
            g.attr('transform', axis == 'bottom'
                                ? `translate(${initCoor}, ${h})`
                                : `rotate(270, ${w},${initCoor}) translate(${w}, ${initCoor})`
                                );                    
            return g;
        }

        for (let i = 0 ; i < count ; i++) {
            const gSlider = generateHandlerG(size, i == 0 ? slCoor : slCoorLow as number);
            gSlider.attr('class', 'handler')
                .attr('fill', 'gray');

            const gGhost = generateHandlerG(size, i == 0 ? slCoor : slCoorLow as number);
            gGhost.attr('class', 'handler-ghost')
                .attr('fill', 'gray')
                .attr('visibility', 'hidden');
            const D = d3.drag()
                .on("start", (event, d) => {
                    console.log(event);
                    gSlider.attr('stroke-width', 4).attr("stroke", "lime");
                    gGhost.attr('visibility', 'visible');
                    event.sourceEvent.stopPropagation();
                })
                .on("drag", (event, d: any) => {
                    let newCoor = 0;
                    if (i==0) {                       
                        slCoor = axis == 'bottom' ? event.x : event.y;
                        if (count == 2)
                            slCoor = slCoor < (slCoorLow as number) 
                                            ? slCoorLow as number
                                            : slCoor;
                        newCoor = slCoor                                               
                    } else {
                        slCoorLow = axis == 'bottom' ? event.x : event.y;
                        slCoorLow = slCoorLow as number < slCoor 
                                    ? slCoorLow
                                    : slCoor;
                        newCoor = slCoorLow as number;
                    }
                    gSlider.attr('transform', 
                                            axis == 'bottom' 
                                            ? `translate(${newCoor},${h})`
                                            : `rotate(270, ${w},${newCoor}) translate(${w},${newCoor})`
                                            );

                })  
                .on("end", (event, d) => {
                    gSlider.attr('stroke-width', 1).attr("stroke", "black");
                    gGhost.attr('visibility', 'hidden');
                    gGhost.attr('transform', gSlider.attr('transform'));
                    event.sourceEvent.stopPropagation();
                });// Could not fathom the proper types; 
                
            gSlider.call(D as any);
            gSlider.on('click', ()=> console.log("TOTOTO")); //  Cant stop that 
            /*
                    .on("click", (e, d) => {
                        console.log("S cliked??");
                        if (e.defaultPrevented) return; // dragged;
                        e.stopPropagation();
                    }); 
            */
            sliders.handlers.push(gSlider);
            sliders.ghosts.push(gGhost);
        }
        console.dir(sliders);
        return sliders;
    }
    
    //https://observablehq.com/@d3/d3v6-migration-guide#event_drag
    draw(){
        this.specsBot   = this.drawHandler("bottom", 2);
        this.specsRight = this.drawHandler("right", 1);
    }
        
}
