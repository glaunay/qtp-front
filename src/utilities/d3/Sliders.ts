import * as d3 from "d3";

/*
Trying SVG implementation
*/

export default class Sliders {
    svg: SVGSVGElement;

    constructor(svg: SVGSVGElement){
        this.svg = svg;
    }

    draw(){
        const size = 200;
        const symbol = d3.symbol().type(d3.symbolTriangle).size(size);
        const h = Number.parseInt(d3.select(this.svg).style("height")),
              w = Number.parseInt(d3.select(this.svg).style("width"));
        const g = d3.select(this.svg).append('g').attr('class', 'symbol');
        const handler = g.append('path')
        .attr('id', 'symbol')
        .attr('d', symbol)
        .attr('class', 'handler');
        g.attr('transform', `translate(${200},${h})`);
        
        const started = ()=>{
            console.log('dragging');
        };
        const dragBehaviour = d3.drag().on("start", started) as any;// as selection: Selection<Element, unknown, any, any>;
        d3.selectAll('.handler').call(dragBehaviour);
        
        console.log(h,w);

    }



}
