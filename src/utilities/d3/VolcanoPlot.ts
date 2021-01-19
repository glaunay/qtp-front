
import * as d3 from "d3";
import { Points } from '../../utilities/models/volcano';

type SVGG = d3.Selection<SVGGElement, unknown, null, undefined>;
type d3IntScale = d3.ScaleLinear<number, number>;



export default class VolcanoPlot {
    svg:    SVGSVGElement;
    public xScale: d3.ScaleLinear<number, number>;
    public yScale: d3.ScaleLinear<number, number>;

    gX?:    SVGG;
    gY?:    SVGG;
    
    constructor(root: SVGSVGElement, xScale: d3IntScale, yScale: d3IntScale, gX?: SVGG, gY?: SVGG) {
        this.svg = root;
        this.xScale = xScale;
        this.yScale = yScale;
        this.gX = gX;
        this.gY = gY;
    }
    draw(data: Points[]) {
        const circles = d3.select(this.svg)
            .append('g')
            .attr('class', 'circlesContainer');

    // Create circle foreach line in tsv
            circles.selectAll(".dot")
                .data(data)
                .enter().append('circle')
                .attr('r', 3)
                .attr('cx', (d) => this.xScale(d.x))
                .attr('cy', (d) => this.yScale(d.y))
                /*.attr('class', circleClass)*/
                .on('mouseenter', (d) => console.log(d));
                /*
                .on("mousemove", tipMove)
                .on('mouseleave', function(d) {
                    return tooltip.style('visibility', 'hidden');
                });*/

    }
}