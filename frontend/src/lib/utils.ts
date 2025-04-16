// src/lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn fonksiyonu ShadCN UI bileşenlerinde className'leri dinamik bir şekilde birleştirmek için kullanılır.
 * clsx ile birleştirilen class'lar tailwind-merge ile optimize edilir.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
