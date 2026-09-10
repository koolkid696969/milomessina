import {fetchFomoMarket} from '../server/campus-market-source.mjs';

export function createMarketHandler({read=fetchFomoMarket,getToken=()=>process.env.FOMO_MARKET_ACCESS_TOKEN,now=Date.now}={}){
  let latest,pending;
  return async function handler(req,res){
    res.setHeader('Cache-Control','no-store');
    if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
    const token=getToken();
    if(!token)return res.status(503).json({code:'FOMO_AUTH_REQUIRED',error:'Fomo connection required'});
    try{
      if(!latest||now()-latest.updatedAt>=60000){
        pending??=read({token,now:now()}).then(value=>latest=value).finally(()=>pending=null);
        await pending;
      }
      return res.status(200).json(latest);
    }catch(error){
      if(error.code==='FOMO_AUTH_REQUIRED'){latest=null;return res.status(503).json({code:'FOMO_AUTH_REQUIRED',error:'Fomo connection required'});}
      return res.status(502).json({error:'Fomo feed unavailable'});
    }
  };
}
export default createMarketHandler();
