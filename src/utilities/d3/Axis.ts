
import * as d3 from "d3";
import { Points, transform } from '../../utilities/models/volcano';
import { NumberValue } from 'd3';
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

export interface ActiveCorners { // Top-left, Bottom-right point coordinates
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface PlotFrame {
    svg:    SVGSVGElement;
    height: number;
    width:  number;
    marginLeft:  Margin;
    marginTop:   Margin;
    marginRight: Margin;
    marginBot:   Margin;
    axisSpecs: AxisSpecs;
    getActiveCorners: () => ActiveCorners;
}


   /*
                        _ _ _ _ _ _ _ _ _ _ _
                            Axis area        |
                        - - - - - - - - - - -|  <- InnerMargin
                            Slider area      |
                        - - - - - - - - - - -|  <- OuterMargin
                            Axis Label area  |
                        _ _ _ _ _ _ _ _ _ _ _|  <- SVG height
    */
class Margin {
    private _inner: number;
    private _outer: number;

    get margin(): number {
        return this._inner + this._outer;
    }
    set margin(v: number) {
        this._inner = v / 2;
        this._outer = v / 2;
    }
    get marginOuter(): number {
        return this._outer;
    }
    set marginOuter(v: number) {
        this._outer = v;
    }
    get marginInner(): number {
        return this._inner;
    }
    set marginInner(v: number) {
        this._inner = v;
    }
    constructor(inner=15, outer=15) {
        this._inner = inner;
        this._outer = outer;
    }
}

interface MarginSpecs {
    inner: number;
    outer: number;
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
    optYtransform?: transform;

    private activeBackGroundCallback?: (x: number, y: number) => void;
    public onActiveBackgroundClick(fn: (x: number, y: number) => void) {
        this.activeBackGroundCallback = fn;
    }
    
    marginLeft  = new Margin();
    marginRight = new Margin();
    marginTop   = new Margin();
    marginBot   = new Margin();

    public getActiveCorners(): ActiveCorners {
        return  {
            x1 : this.marginLeft.margin,
            x2 : Number.parseInt( d3.select(this.svg).attr('width') ) - this.marginRight.margin,
            y1 : this.marginTop.margin,
            y2 : Number.parseInt( d3.select(this.svg).attr('height') ) - this.marginBot.margin
        } as ActiveCorners;
    }

    // Setters may have to reflect also to renderer ?

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
    get innerWidth(): number{
        return this.width - this.marginRight.margin - this.marginLeft.margin;
    }
    get innerHeight(): number{
        return this.height - this.marginTop.margin - this.marginBot.margin;
    }

    constructor(root: SVGSVGElement, height: number, width: number, yTransform?: transform) {
        this.svg    = root;
        this.height = height;
        this.width  = width;
        this.optYtransform = yTransform;
        //this.computeMargins();
        this.frame = d3.select(this.svg)
            .append('g');
        this.frame .attr('class', 'symbol-container');
            //.attr('transform', `translate(${this.marginLeft}, ${this.height -  this.marginBot })`);// ${this.marginBot})`);
    }
    /*private computeMargins(){
        this.innerWidth  = this.width - this._marginRight - this._marginLeft;
        this.innerHeight = this.height - this._marginTop - this._marginBot;
    }*/
    draw(data: Array<Points>, xLabel: string, yLabel: string, 
         axisOrientation: AxisOrientation='classic', flip=false) {
        
        
        this.marginBot.marginOuter = 30;
        
        
        /*
            Create Label Elements
        */
        const gXlabel = d3.select(this.svg)
                         .append('g').attr('class', 'x label');
        const xText = gXlabel.append('text')
            .attr('class', 'label')
            .attr('transform',`translate( ${this.innerWidth / 2}, 0)`)
            .attr('text-anchor', 'middle')
            .text(xLabel)
            .style("font-family", "Verdana")
            .style("font-size", 18)
            .style("stroke", "black")
            .style("fill","black");

        const gYlabel = d3.select(this.svg)
                            .append('g').attr('class', 'y label');
        const yText = gYlabel.append('text')
            .attr('class', 'label')
            .style('text-anchor', 'middle')
            .html(this.optYtransform ? `${this.optYtransform}[ ${yLabel} ]` : yLabel);

    

        /*
            Set Margins to account for labels occupancy -- TO DO --
        */
        /*
        const xLabeblOffset = gXlabel.node()?.getBoundingClientRect().height;
        this.marginBot.marginOuter = xLabeblOffset ? xLabeblOffset : 0;
        
        const yLabeblOffset = gYlabel.node()?.getBoundingClientRect().height;
        this.marginLeft.marginOuter = yLabeblOffset ? yLabeblOffset : 0;
       */
        this.marginBot.marginOuter  = 45;
        this.marginBot.marginInner  = 45;
        this.marginLeft.marginOuter = 25;
        this.marginLeft.marginInner = 45;


        this.setScale(data, flip);
        
        const yTickFormat = (n: NumberValue) =>  d3.format(".2r")(n); //getBaseLog(10, n));
        const xAxis = d3.axisBottom(this.xScale);
        const  yAxis = d3.axisLeft(this.yScale)
        .ticks(10)
        .tickFormat(yTickFormat)

        this.gX = d3.select(this.svg).append('g')
        .attr('class', 'x axis')
        .call(xAxis);
        
        this.gY = d3.select(this.svg).append('g')
        .attr('class', 'y axis')
        .call(yAxis);
        
        
        //const yAxisOffset =  this.gY.node()?.getBoundingClientRect().width;
        //this.marginLeft.marginInner = yAxisOffset ? yAxisOffset * 1.5 : 0;
        
       
       
                
        
       
      
        const frame = this.getActiveCorners();
        
        let xLabelPos = 0;
        const _ = xText.node();
        if(_ != null)
            xLabelPos =  (frame.x2 - frame.x1 - _.getBoundingClientRect().width ) / 2;            
        gXlabel.attr('transform',`translate(${xLabelPos}, ${this.height - 4})`); //
        let yLabelPos = 0;
        const a = yText.node();
        if(a != null) {
            yLabelPos = this.height / 2;
            console.log(frame.y1, frame.y2, a.getBoundingClientRect().width);
        }
        gYlabel.attr('transform', `translate(${this.marginLeft.marginOuter}, ${yLabelPos}) rotate(-90)`)
        
        
       

        if(axisOrientation == 'cross')
            yAxis.tickSizeOuter(0);
        
      
        
        /* Position Axis */
        this.gY.attr('transform', axisOrientation == 'cross'
                                   ? `translate(${this.marginLeft.margin + this.innerWidth/2}, 0)`
                                   : `translate(${this.marginLeft.margin}, 0)`
                )                
        this.gX.attr('transform', `translate(0, ${this.height - this.marginBot.margin})`);
        if(axisOrientation == 'cross')
            this.gY.selectAll(".tick line")
                   .attr("transform", "translate(3,0)");

               
        
        // Restricting bkg click to within margins area
       
        d3.select(this.svg).on('click',
            (e) => {
                console.log("CLCIK CTRL" + this );
                if( e.layerX > frame.x1 && 
                    e.layerX < frame.x2 &&
                    e.layerY > frame.y1 && 
                    e.layerY < frame.y2
                    ) 
                    if(this.activeBackGroundCallback)
                        this.activeBackGroundCallback(e.layerX, e.layerY);       
            });

       

        return data;
         
    }

    setScale(data: Array<Points>,flip: boolean){
        const frame = this.getActiveCorners();


        const [min, max] = d3.extent(data, (d)=>d.x);

        console.log(`Setting xScale ${min}:${max} -> ${frame.x1}:${frame.x2}`);
        console.dir(this.marginLeft);
        console.dir(frame);
        if(min != undefined && max != undefined)
            this.xScale.range([frame.x1, frame.x2])
                .domain([min, max])
                .nice();
        else 
            console.error("Undefined value in x Range");

        const [_min, _max] = d3.extent(data, (d) =>  d.y);
        if ( _min != undefined && _max != undefined)
            this.yScale.range(flip 
                                ? [frame.y1, frame.y2]
                                : [frame.y2, frame.y1])
                .domain([_min, _max])
                .nice();
        else
            console.error("Undefined value in y Range");

        console.log("###setScale");
        console.log(this.xScale);
        console.log(this.yScale);
    }
}