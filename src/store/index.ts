import { map } from 'd3';
import { createStore } from 'vuex'
import * as XLSX from 'xlsx';

export interface WorkBookStore {
  count: number;
  workBook: null | XLSX.WorkBook;
  activeSheet: null|string;
  dimensions: [number,number];
  array: Array<Array<any>>;
}

const parseRange = (refs: string)=>{
  const [rowRange, colRange] = refs.split(':');

}

export default createStore({
  state: {
    count: 0,
    workBook: null,
    activeSheet:null,
    dimensions:[0, 0],
    array: [[]]
  } as WorkBookStore,
  getters : {
    test(state): string {
      return `HEAD:: ${state.count}<<`;
    },
    sheetNames(state): string[] {
      if (state?.workBook?.SheetNames != null)
        return state.workBook.SheetNames;
      return [];
    },
    json(state, getters): Record<string, any>|null {
      const _ = getters.getActiveSheet
      return _ ?
              XLSX.utils.sheet_to_json(_)
              : null;
    },
    asArray(state, getters): Array<Array<any>>|null {
      const _ = getters.getActiveSheet;      
      return _ ?
              XLSX.utils.sheet_to_json(_, {header:1})
              : null;
    },
    getActiveSheet(state): XLSX.WorkSheet|null {
      if(state?.activeSheet) {
        const _ = state?.workBook?.Sheets[state?.activeSheet];
        return _ ? _ : null;
      }
      return null;
    },
    dimensions(state): [number,number]{
      return state.dimensions;
    },
    cell(state, getters) {
      const [nr, nc] = getters.dimensions;
      
      return (r: number, c: number)=>{
        if(r > nr || c > nc){
          console.error(`Accessing cell {${r}, ${c}}  out of range [${nr}, ${nc}]`);
          return null;
        }
        return state.array[r][c];
      }
    },
    currentSheetHeaders(state, getters): string[]{
      const [nRow, nCol] = getters.dimensions;
      const _: Array<string> = [];
      for (let c =0 ; c < nCol ; c++){
        _.push(getters.cell(0, c));
      }
      return _;
    },
    getColDataByName(state, getters): (colName: string, type: string) => number|any[]|undefined { // We should index column by first element eg : { "colName":[ COL_DATA ]}
      const [nRow, nCol] = getters.dimensions;
      return (colName: string, type="number") => {
        for (let j = 0; j < nCol ; j++) {
          if(getters.cell(0, j) === colName) {
            const w = [...Array(nRow - 1).keys()].map( (i)=> {
              return type === 'number' ?
                     Number.parseFloat(getters.cell(i+1, j)) :
                     getters.cell(i+1, j);
            });
           // console.log(`Vector ${colName}`);
           // console.log(w);
            return w;
          }
        }
        return undefined;
      };
  }
  },
  mutations: {
    workBook(state, workBook: XLSX.WorkBook): void {
      state.workBook = workBook;
      state.activeSheet = state.workBook?.SheetNames[0] as string;
    },
    dimensions(state, dim: [number, number]): void {      
      state.dimensions = dim;     
    },
    array(state, arr: Array<Array<any>>): void {      
      state.array = arr;     
    },
    pushUp (state): void {
      // mutate state
      state.count++
    }
  },
  actions: {
    initStoreBook(context, workBook): void {
      console.log("Creating Workbook store");
      context.commit('workBook', workBook);
      const _ = context.getters.asArray;
      context.commit('dimensions', _ ? [_.length, _[0].length] : [0,0] );
      context.commit('array', _ ? _ : [[]]);
    }
  },
  modules: {
  }
})


