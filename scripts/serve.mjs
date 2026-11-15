import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const port=Number(process.env.PORT)||4173;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{const raw=decodeURI(new URL(req.url,'http://localhost').pathname);const file=resolve('.',raw.replace(/^\/+/, '')||'index.html');if(!file.startsWith(resolve('.')+sep)&&file!==resolve('.')){res.writeHead(403).end();return;}try{const s=await stat(file);if(!s.isFile()) throw 0;res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile('404.html'));}}).listen(port,()=>console.log(`Plura preview at http://localhost:${port}`));
