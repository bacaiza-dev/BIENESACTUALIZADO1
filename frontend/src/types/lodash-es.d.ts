declare module 'lodash-es' {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean
      maxWait?: number
      trailing?: boolean
    }
  ): T & { cancel(): void; flush(): ReturnType<T> }

  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean
      trailing?: boolean
    }
  ): T & { cancel(): void; flush(): ReturnType<T> }

  export function orderBy<T>(collection: T[], iteratees?: any[], orders?: ('asc' | 'desc')[]): T[]

  export function get(object: any, path: string | string[], defaultValue?: any): any
  export function isEmpty(value: any): boolean
  export function isEqual(value: any, other: any): boolean
  export function cloneDeep<T>(value: T): T
  export function omit<T extends object, K extends keyof T>(object: T, ...paths: K[]): Omit<T, K>
  export function pick<T extends object, K extends keyof T>(object: T, ...paths: K[]): Pick<T, K>
}
