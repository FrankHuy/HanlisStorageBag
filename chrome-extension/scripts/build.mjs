import {mkdir,readFile,writeFile,cp,readdir,stat} from 'node:fs/promises';
import {deflateRawSync,deflateSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {checkProject} from './check.mjs';
const root=new URL('../',import.meta.url);
const dist=new URL('dist/',root);
await checkProject();
await mkdir(dist,{recursive:true});
for(const name of ['manifest.json','popup.html','popup.css','src','data'])await cp(new URL(name,root),new URL(name,dist),{recursive:true});
await cp(new URL('README.md',root),new URL('README.md',dist));
await mkdir(new URL('icons/',dist),{recursive:true});
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function pngChunk(type,data){const tag=Buffer.from(type);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([length,tag,data,crc]);}
function icon(size){const rows=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){for(let x=0;x<size;x++){const nx=(x+.5)/size,ny=(y+.5)/size;const body=(nx-.5)**2/.052+(ny-.61)**2/.069<1 && ny>.34;const neck=ny>.2&&ny<.39&&Math.abs(nx-.5)<.115;const tie=ny>.35&&ny<.39&&Math.abs(nx-.5)<.17;const glyph=(Math.abs(nx-.5)<.016&&ny>.48&&ny<.73)||(Math.abs(ny-.59)<.016&&nx>.40&&nx<.60);const edge=body && ((nx-.5)**2/.043+(ny-.61)**2/.058>1);const gold=tie||glyph||edge||(neck&&(Math.abs(nx-.5)>.085||ny<.23));const color=gold?[204,185,135,255]:body||neck?[49,86,65,255]:[23,54,45,255];const offset=y*(size*4+1)+1+x*4;color.forEach((v,i)=>rows[offset+i]=v);}}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',ihdr),pngChunk('IDAT',deflateSync(rows)),pngChunk('IEND',Buffer.alloc(0))]);}
for(const size of [16,32,48,128])await writeFile(new URL(`icons/icon-${size}.png`,dist),icon(size));
async function files(directory,prefix=''){let result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const path=prefix+entry.name;if(entry.isDirectory())result.push(...await files(new URL(entry.name+'/',directory),path+'/'));else result.push(path);}return result.sort();}
const paths=await files(dist);const local=[];const central=[];let offset=0;
for(const path of paths){const data=await readFile(new URL(path,dist));const packed=deflateRawSync(data);const name=Buffer.from(path);const checksum=crc32(data);const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt32LE(checksum,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt32LE(checksum,16);record.writeUInt32LE(packed.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);local.push(header,name,packed);central.push(record,name);offset+=header.length+name.length+packed.length;}
const directory=Buffer.concat(central);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(paths.length,8);end.writeUInt16LE(paths.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
await mkdir(new URL('releases/',root),{recursive:true});
const archive=new URL(`releases/hanli-storage-bag-chrome-v${manifest.version}.zip`,root);
await writeFile(archive,Buffer.concat([...local,directory,end]));
console.log(`Load unpacked: ${fileURLToPath(dist)}`);
console.log(`ZIP: ${fileURLToPath(archive)} (${(await stat(archive)).size} bytes)`);
