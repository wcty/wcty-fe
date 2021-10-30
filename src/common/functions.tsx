import { NearbyEntriesQuery } from "generated";

export function toSelected(entry:NearbyEntriesQuery['entries_nearby'][number]){
  return {
    id: entry?.id,
    geometry: entry?.geometry,
    source: entry?.type||'',
    type: 'Feature',
    properties:{
      id: entry?.id,
      name: entry?.name||'',
      created_at: entry?.created_at,
      description: entry?.description||'',
      image: entry?.image||'',
      members: entry?.members_count,
      members_count: entry?.members_count,
      modified_at: entry?.modified_at,
      type: entry?.type
    }
  } as const
}

export function polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(x:number=0, y:number=0, radius:number, startAngle:number, endAngle:number){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);
  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  var d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
  ].join(" ");
  return d;       
}