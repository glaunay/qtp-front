import * as d3 from "d3";
type GSel =  d3.Selection<SVGGElement, unknown, null, undefined>;
const re = /translate\([\s]*([-\d.]+),[\s]*([-\d.]+)\)/;

//const re = /translate\([\s]*([+-]?[0-9]*[.])?[0-9]+),

//const re = /translate([\s]*([+-]?([0-9]*[.])?[0-9]+)[\s]*,[\s]*([+-]?([0-9]*[.])?[0-9]+)\)/;
const trCoordinates = (g: GSel): [number, number] => {
    const _ = g.attr('transform');
    const h = re.exec(_);
    if(h != undefined)
        return [ Number.parseInt(h[1]), Number.parseInt(h[2]) ];
    else
        throw(`Cant parse translate arguments from ${_}`);
};

export { trCoordinates }
