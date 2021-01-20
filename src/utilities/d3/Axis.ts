
import * as d3 from "d3";
import { Points } from '../../utilities/models/volcano';
import { NumberValue } from 'd3';

/* To configure absciss positioning */
interface AxisSpec {
    range: [number,number];
    absolutePosition: number;
}

interface AxisSpecs {
    xAxis: AxisSpec;
    yAxis: AxisSpec;
}

// root is actually a Dereferenced Ref<SVGSVGElement>, let's see....
export default class Axis {
    svg:    SVGSVGElement;
    height: number;
    width:  number;
    frame: d3.Selection<SVGGElement, unknown, null, undefined>;
    public xScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
    public yScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
    gX?:    d3.Selection<SVGGElement, unknown, null, undefined>;
    gY?:    d3.Selection<SVGGElement, unknown, null, undefined>;
    
    // Setters may have to reflect also to renderer ?
    private _marginLeft=25;
    get marginLeft(): number {
        return this._marginLeft;
    }
    set marginLeft(v: number) {
        this._marginLeft = v;
        this.computeMargins();
    } 
    private _marginRight=15;
    get marginRight(): number {
        return this._marginRight;
    }
    set marginRight(v: number) {
        this._marginRight = v;
        this.computeMargins();
    } 
    private _marginTop=15;
    get marginTop(): number {
        return this._marginTop;
    }
    set marginTop(v: number) {
        this._marginTop = v;
        this.computeMargins();
    } 
    private _marginBot=40;
    get marginBot(): number {
        return this._marginBot;
    }
    set marginBot(v: number) {
        this._marginBot = v;
        this.computeMargins();
    } 
    innerWidth=0;
    innerHeight=0;
    constructor(root: SVGSVGElement, height: number, width: number) {
        this.svg    = root;
        this.height = height;
        this.width  = width;

        this.computeMargins();
        this.frame = d3.select(this.svg)
            .append('g');
        this.frame .attr('class', 'symbol-container');
            //.attr('transform', `translate(${this.marginLeft}, ${this.height -  this.marginBot })`);// ${this.marginBot})`);
    }
    private computeMargins(){
        this.innerWidth  = this.width - this._marginRight - this._marginLeft;
        this.innerHeight = this.height - this._marginTop - this._marginBot;
    }
    draw(data: Array<Points>, xLabel: string, yLabel: string, flip=false) {
        
        const yTickFormat = (n: NumberValue) =>  d3.format(".2r")(n); //getBaseLog(10, n));
                
        console.log("Coucou");
        console.log(this.marginLeft);
        this.setScale(data, flip);
        const xAxis = d3.axisBottom(this.xScale);
        this.gX = d3.select(this.svg).append('g')
                .attr('class', 'x axis')
                //.attr('transform', `translate(${this.marginLeft}, ${this.height -  this.marginBot })`)
                .attr('transform', `translate(0, ${this.innerHeight})`)
                .call(xAxis);
        this.gX.append('text')
                .attr('class', 'label')
                .attr('transform', `translate(${this.innerWidth / 2}, ${this.marginBot/2})`)
                .attr('text-anchor', 'middle')
                .text(xLabel);

        const  yAxis = d3.axisLeft(this.yScale)
                .ticks(5)
                .tickFormat(yTickFormat);
        
        this.gY = d3.select(this.svg).append('g')
                .attr('class', 'y axis')
                .attr('transform', `translate(${this.marginLeft}, 0)`)                
                .call(yAxis);

        this.gY.append('text')
                .attr('class', 'label')
                .attr('transform', 'translate(' + (0 - this.marginLeft / 1.25) + ',' + (this.height / 2) + ') rotate(-90)')
                .style('text-anchor', 'middle')
                .html(yLabel);
        return data;
         
    }

    setScale(data: Array<Points>,flip: boolean){
        
        const [min, max] = d3.extent(data, (d)=>d.x);
        if(min != undefined && max != undefined)
            this.xScale.range([this.marginLeft, this.innerWidth])
                .domain([min, max])
                .nice();
        else 
            console.error("Undefined value in x Range");

        const [_min, _max] = d3.extent(data, (d) =>  d.y);
        if ( _min != undefined && _max != undefined)
            this.yScale.range(flip 
                                ? [this.marginTop, this.innerHeight]
                                : [this.innerHeight, this.marginTop] )
                .domain([_min, _max])
                .nice();
        else
            console.error("Undefined value in y Range");

        console.log("###setScale");
        console.log(this.xScale);
        console.log(this.yScale);
    }
}