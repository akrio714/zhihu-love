/**
 * 使local支持存储对象
 * @param key 保存的key值
 * @param obj 保存的对象
 */
export function setItem(key:string,obj:any){
    // 将对象格式化成string
    const string = JSON.stringify(obj)
    window.localStorage.setItem(key,string)
}
/**
 * 使local支持存储对象
 * @param key 保存的key值
 * @param def 缺省值
 */
export function getItem<T>(key:string,def?:T):T|undefined{
    // 将对象格式化成string
    const val = window.localStorage.getItem(key)
    if(val){
        return JSON.parse(val) as T
    }else {
        return def
    }
}