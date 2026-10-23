'use client';
import { useState, type ReactNode } from 'react';
export default function FieldNote({number,title,caption,id,children}:{number:string;title:string;caption:string;id?:string;children:ReactNode}) {
 const [open,setOpen]=useState(false);
 return <details className="field-note" id={id} onToggle={e=>setOpen(e.currentTarget.open)}><summary><span>{number}</span><h3>{title}</h3><span>{caption}</span><b>+</b></summary>{open&&children}</details>;
}
