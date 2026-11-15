import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';

function mockRes() {
  return {
    headers:{}, statusCode:200, payload:null,
    setHeader(key,value){this.headers[key]=value;return this;},
    status(n){this.statusCode=n;return this;},
    json(value){this.payload=value;return this;}
  };
}
const valid={name:'Test Person',email:'test@example.org',message:'I have a brand project.',plan:'Branding Pro'};
const envNames=['RESEND_API_KEY','CONTACT_FROM','CONTACT_TO'];
const saved=Object.fromEntries(envNames.map(name=>[name,process.env[name]]));
function clearEnv(){envNames.forEach(name=>delete process.env[name]);}
function restoreEnv(){for(const key of envNames){if(saved[key] === undefined) delete process.env[key];else process.env[key]=saved[key];}}

test('rejects unsupported methods', async()=>{clearEnv();const res=mockRes();await handler({method:'GET'},res);assert.equal(res.statusCode,405);assert.equal(res.headers.Allow,'POST');restoreEnv();});
test('validates required fields', async()=>{clearEnv();for(const body of [{},{...valid,email:'not-an-email'},{...valid,name:'A'}, {...valid,message:'x'}, {...valid,message:'x'.repeat(3001)}]){const res=mockRes();await handler({method:'POST',body},res);assert.equal(res.statusCode,400);}restoreEnv();});
test('does not claim delivery without configuration', async()=>{clearEnv();const res=mockRes();await handler({method:'POST',body:valid},res);assert.equal(res.statusCode,503);assert.ok(res.payload.error);restoreEnv();});
test('sends only when the provider accepts the message',async()=>{
  for(const [key,value] of Object.entries({RESEND_API_KEY:'test-key',CONTACT_FROM:'verified@example.org',CONTACT_TO:'inbox@example.org'}))process.env[key]=value;
  const before=global.fetch;let received;
  global.fetch=async(url,options)=>{received={url,...options};return {ok:true,status:200};};
  try{const res=mockRes();await handler({method:'POST',body:valid},res);assert.equal(res.statusCode,200);assert.equal(res.payload.success,true);assert.equal(received.url,'https://api.resend.com/emails');const body=JSON.parse(received.body);assert.equal(body.to[0],'inbox@example.org');assert.equal(body.reply_to,valid.email);}
  finally{global.fetch=before;restoreEnv();}
});
test('reports provider failure without false success',async()=>{
  for(const [key,value] of Object.entries({RESEND_API_KEY:'test-key',CONTACT_FROM:'verified@example.org',CONTACT_TO:'inbox@example.org'}))process.env[key]=value;
  const before=global.fetch;const beforeError=console.error;global.fetch=async()=>({ok:false,status:429});console.error=()=>{};
  try{const res=mockRes();await handler({method:'POST',body:valid},res);assert.equal(res.statusCode,502);assert.ok(res.payload.error);}
  finally{global.fetch=before;console.error=beforeError;restoreEnv();}
});
