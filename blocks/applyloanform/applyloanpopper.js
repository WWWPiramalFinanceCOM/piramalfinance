import"./loanformdom.js";export let dpObj;export function applyLoanPopper(){const r=document.getElementById("stateparent"),p=document.getElementById("statecontainer");Popper.createPopper(r,p,{placement:"bottom",modifiers:[{name:"flip",options:{}},{name:"offset",options:{offset:[0,0]}}]});const d=document.getElementById("branchparent"),s=document.getElementById("branchcontainer");Popper.createPopper(d,s,{placement:"bottom",modifiers:[{name:"flip",options:{}},{name:"offset",options:{offset:[0,0]}}]}),window.matchMedia("(max-width: 767px)").matches?dpObj=new AirDatepicker("#loan-form-dob",{position({$datepicker:e,$target:o,$pointer:t,done:a}){const n=Popper.createPopper(o,e,{modifiers:[{name:"flip",options:{fallbackPlacements:["top","bottom"],padding:{top:10},"z-index":200}},{name:"offset",options:{offset:[0,10]}},{name:"arrow",options:{element:t}}]});return function(){n.destroy(),a()}},autoClose:!0,maxDate:new Date,locale:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",clear:"Clear",dateFormat:"dd/MM/yyyy",firstDay:0}}):dpObj=new AirDatepicker("#loan-form-dob",{position({$datepicker:e,$target:o,$pointer:t,done:a}){const n=Popper.createPopper(o,e,{placement:"top",modifiers:[{name:"flip",options:{fallbackPlacements:["top","bottom"],padding:{top:10},"z-index":200}},{name:"offset",options:{offset:[0,10]}},{name:"arrow",options:{element:t}}]});return function(){n.destroy(),a()}},autoClose:!0,maxDate:new Date,locale:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",clear:"Clear",dateFormat:"dd/MM/yyyy",firstDay:0}})}

