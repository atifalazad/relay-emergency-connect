export const ESCALATION_MS=30000;
export const ACTIVE_STATUSES=['waiting','accepted','escalated','escalation-failed','failed'];
export function escalateRequest(state,now,offline,force=false){
 if(!['waiting','escalation-failed'].includes(state.status))return state;
 if(state.status==='escalation-failed'&&!force)return state;
 if(!force&&(!state.sentAt||now-state.sentAt<ESCALATION_MS))return state;
 return {...state,status:offline?'escalation-failed':'escalated',escalatedAt:offline?state.escalatedAt||null:now};
}
export function reportNoAdult(state,now,offline){
 if(!['waiting','accepted','escalated','escalation-failed'].includes(state.status))return state;
 return {...state,status:offline?'escalation-failed':'escalated',stillWaitingAt:now,escalatedAt:offline?state.escalatedAt||null:now};
}
export function confirmHandover(state,confirmed){
 if(confirmed!==true||!['waiting','accepted','escalated','escalation-failed'].includes(state.status))return state;
 return {...state,status:'resolved',place:null,block:null,floor:null,locationChoice:null,landmark:''};
}
export function locationLabel(state,places){
 const place=places.find(p=>p.id===state.place);
 if(state.locationChoice==='unknown')return 'Location unknown';
 const hasFloor=Number.isInteger(state.floor);
 const floor=hasFloor?(state.floor===0?'Ground floor':'Floor '+state.floor):'Floor not specified';
 const block=state.block||(state.place==='west'?'A':state.place==='central'?'C':null);
 if(state.locationChoice==='indoor'&&block)return block+' Block · '+floor;
 if(place)return place.name+(place.kind==='building'&&hasFloor?' · '+floor:'');
 if(state.locationChoice==='indoor')return floor+' · Block optional';
 if(state.locationChoice==='outside')return 'Outside';
 return 'Location not chosen';
}
