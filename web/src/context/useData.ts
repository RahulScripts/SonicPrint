import * as React from "react"
import { DataContext, type DataContextValue } from "@/context/DataProvider"

export function useData(): DataContextValue {
  const ctx = React.useContext(DataContext)
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider")
  }
  return ctx
}
