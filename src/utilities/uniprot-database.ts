/*
Singleton implementation of IndexDB based uniprot storage

https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
https://stackoverflow.com/questions/41586400/using-indexeddb-asynchronously

*/

import store from "@/store";
import { resolveComponent } from "vue";

interface UniprotDatum {
    name?: string;
    GO?: Map<string, string>[];
    id: string;
    geneName?: string;
    fullName?: string;
}

type UniprotFetch = { [index: string]: UniprotDatum|null };


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UniprotDatabase {
    let providerURL: string|undefined;
    const dbName = "uniprotDB";
    let maxItem: number;
    let DBOpenRequest: IDBOpenDBRequest;
    const V_NUM = 3; 
    let DB: IDBDatabase;
    const handshake = async (url?: string) => {
        try {
            const response = await fetch(`${url ? url : ''}/api/uniprot/dimension`, {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }});
            const json =  await response.json();
            maxItem = json?.totalEntry;
            return true;
        } catch(e) {
            console.error(e); // 30
            return false;
        }
    }

    export const fetchFrom = async (uniprotIDs: string[]): Promise<UniprotFetch> => {
        console.log(`ff Loading ${uniprotIDs.length} items ff`);
        const response = await fetch(`${providerURL ? providerURL : ''}/api/uniprot/many`, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({'uniprotIDs' : uniprotIDs})
        });

        const uniprotData: UniprotFetch = await response.json();
        if (!uniprotData)
            throw("No data loaded");
    
        return uniprotData;        
    }
    
    export const add = async (uniprotIDs: string[]) => {
        console.log("ADD CALL");
        const uniprotData: UniprotFetch = await fetchFrom(uniprotIDs);
        //console.log(`Fetched this`);
        //console.dir(uniprotData);
        return new Promise((res, rej) => {
            DBOpenRequest = indexedDB.open(dbName, V_NUM);
            DBOpenRequest.onerror = (event) => {
                rej(Error("IndexedDB database error"));
            };
            DBOpenRequest.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const objectStore = db.createObjectStore("uniprotEntity", {keyPath: "id"});
            };
            DBOpenRequest.onsuccess = (event) => {
                const database      = (event.target as IDBOpenDBRequest).result;
                const transaction   = database.transaction(["uniprotEntity"], 'readwrite');
                const objectStore   = transaction.objectStore("uniprotEntity");
                let cnt = 0;
                Object.keys(uniprotData).forEach( (uniprotID: string) => {
                    //console.log(uniprotID);
                    //console.dir(uniprotData);
                    const uniprotDatum = uniprotData[uniprotID];
                    if(uniprotDatum == null){
                        console.error(`${uniprotID} was fetched as null`);
                        cnt++;
                    }else{
                        const objectRequest = objectStore.put(uniprotDatum); // Overwrite if exists
                        objectRequest.onerror = (event) => {
                            rej(Error('Error text'));
                        };
                        objectRequest.onsuccess = (event) => {
                            cnt++;
                            if (cnt == uniprotIDs.length)
                                res(cnt);
                        };
                    }
                });
            };
        });
    }
    export const readAll = async () => {
        console.log("Trying to read");
        return new Promise((res, rej) => {
            const dbRequest = indexedDB.open(dbName, V_NUM);
            dbRequest.onerror = (event) => {
                rej(Error("Error text"));
            };
            dbRequest.onupgradeneeded = function(event: any) {
                // Objectstore does not exist. Nothing to load
                event.target.transaction.abort();
                rej(Error('Not found'));
            };
            dbRequest.onsuccess = function(event) {
                const database      = (event.target as IDBOpenDBRequest).result;
                const transaction   = database.transaction(["uniprotEntity"]);
                const objectStore   = transaction.objectStore("uniprotEntity");
                let  n = 0;
                const cursor = objectStore.openCursor();
                cursor.onerror = (event) => {
                    rej(Error('cursor error'));
                };
                cursor.onsuccess = (event: any) => {
                    const cursor = event.target.result;            
                    if (cursor) {
                         const d = cursor.value as UniprotDatum;
                         console.log(`Name for id ${cursor.key} is ${d.name}`);
                         cursor.continue();
                         n++;
                    } else {
                        res(n);
                        console.warn("No more entries!");
                    }
                };
            };

        });
    }

    export const get = async (id: string) => {
        return new Promise(
            function(resolve, reject) {
              const dbRequest = indexedDB.open(dbName, V_NUM);
        
              dbRequest.onerror = function(event) {
                reject(Error("indexDB get Error"));
              };
        
              dbRequest.onupgradeneeded = function(event: any) {
                // Objectstore does not exist. Nothing to load
                event.target.transaction.abort();
                reject(Error('indexDB not found'));
              };
        
              dbRequest.onsuccess = function(event) {
                const database      = (event.target as IDBOpenDBRequest).result;
                const transaction   = database.transaction(["uniprotEntity"]);
                const objectStore   = transaction.objectStore("uniprotEntity");
                const objectRequest = objectStore.get(id);
        
                objectRequest.onerror = function(event) {
                  reject(Error(`uniprotID ${id} access error`));
                };
        
                objectRequest.onsuccess = function(event) {
                  if (objectRequest.result) resolve(objectRequest.result);
                  else reject(Error(`uniprotID ${id} not found`));
                };
              };
            }
          );
    } 
     
}