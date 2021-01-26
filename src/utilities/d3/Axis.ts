
import * as d3 from "d3";
import { Points } from '../../utilities/models/volcano';
import { NumberValue, thresholdSturges } from 'd3';
import { trCoordinates } from './utils';

// classic is the y axis as left side of rectangle and x as it base
// tTilted is the yaxis as the median of base, base being x axis
// ie : y positions are always graphically "positive" while x can be "negative or positive"
// cross is y and y axis mutual medians
// ie : y and x can be graphicaly "negative or positive"

type AxisOrientation = 'classic' | 'tTilted' | 'cross';   
type GSel =  d3.Selection<SVGGElement, unknown, null, undefined>;

/* To configure absciss positioning */
interface AxisSpec {
    range: [number,number];
    absolutePosition: number; // Abs position in x-units for y axis
}                             // Abs position in y-units for x axis

interface AxisSpecs {
    xAxis: AxisSpec;
    yAxis: AxisSpec;
}

interface ActiveCorners { // Top-left, Bottom-right point coordinates
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface PlotFrame {
    svg:    SVGSVGElement;
    height: number;
    width:  number;
    marginLeft: number;
    marginTop: number;
    marginRight: number;
    marginBot: number;
    axisSpecs: AxisSpecs;
    getActiveCorners: () => ActiveCorners;
}

// root is actually a Dereferenced Ref<SVGSVGElement>, let's see....
export class Axis implements PlotFrame{
    svg:    SVGSVGElement;
    height: number;
    width:  number;
    frame: d3.Selection<SVGGElement, unknown, null, undefined>;
    public xScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
    public yScale: d3.ScaleLinear<number, number> = d3.scaleLinear();
    gX?:    GSel;
    gY?:    GSel;
    

    private activeBackGroundCallback?: (x: number, y: number) => void;
    public onActiveBackgroundClick(fn: (x: number, y: number) => void) {
        this.activeBackGroundCallback = fn;
    }
    
    public getActiveCorners(): ActiveCorners {
        return  {
            x1 : this.marginLeft,
            x2 : Number.parseInt( d3.select(this.svg).attr('width') ) - this.marginRight,
            y1 : this.marginTop,
            y2 : Number.parseInt( d3.select(this.svg).attr('height') ) - this.marginBot
        } as ActiveCorners;
    }

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
    get axisSpecs(): AxisSpecs{
        const xTr = trCoordinates(this.gX as GSel);
        const yTr = trCoordinates(this.gY as GSel)
        return {
            xAxis: { 
                range: this.xScale.range() as [number, number],
                absolutePosition: xTr[1]
            },
            yAxis: { 
                range: this.yScale.range() as [number, number],
                absolutePosition: xTr[0]
            }
        };
    }
    public innerWidth = 0;
    public innerHeight = 0;

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
    draw(data: Array<Points>, xLabel: string, yLabel: string, 
         axisOrientation: AxisOrientation='classic', flip=false) {
        
        const yTickFormat = (n: NumberValue) =>  d3.format(".2r")(n); //getBaseLog(10, n));
                
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
                .ticks(10)
                .tickFormat(yTickFormat)
        if(axisOrientation == 'cross')
            yAxis.tickSizeOuter(0);
        console.log("Y-AXIS");
        console.log(yAxis);
        
        this.gY = d3.select(this.svg).append('g')
                .attr('class', 'y axis')
                .attr('transform', () => {
                    if(axisOrientation == 'cross')
                        return `translate(${this.marginLeft + this.innerWidth/2}, 0)`;
                    return `translate(${this.marginLeft}, 0)`
                })                
                .call(yAxis);
        if(axisOrientation == 'cross')
            this.gY.selectAll(".tick line")
                   .attr("transform", "translate(3,0)");

               
        this.gY.append('text')
                .attr('class', 'label')
                .attr('transform', 'translate(' + (0 - this.marginLeft / 1.25) + ',' + (this.height / 2) + ') rotate(-90)')
                .style('text-anchor', 'middle')
                .html(yLabel);
        // Restricting bkg click to within margins area
        d3.select(this.svg).on('click',
            (e) => {
                if( e.layerX > this.marginLeft && 
                    e.layerX < (this.marginLeft + this.innerWidth) &&
                    e.layerY > this.marginTop && 
                    e.layerY < (this.marginTop + this.innerHeight)
                    ) 
                    if(this.activeBackGroundCallback)
                        this.activeBackGroundCallback(e.layerX, e.layerY);       
            });
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