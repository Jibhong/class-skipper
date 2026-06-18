export function devlog(message:string){
    if(process.env.NODE_ENV === "development")return;
    console.log(message)
}
export function devwarn(message:string){
    if(process.env.NODE_ENV === "development")return;
    console.warn(message)
}
export function deverr(message:string){
    if(process.env.NODE_ENV === "development")return;
    console.error(message)
}