type plotData = {
    x: number[];
    y: number[];
    xLabel: string;
    yLabel: string;
};

/* Container to build scatter plot with associated datum */
interface Points {
    x: number;
    y: number;
    d?: string|number|Object;
};
interface DatumPoints extends Points {
    datum: Record<string, string|number>
}

type transform = "log10" | "-log10" | "none";


export{ Points, plotData, transform };