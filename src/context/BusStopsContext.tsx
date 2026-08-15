"use client" //This is used to ensure hooks like useStae/useContext run in the browser which is important becuase the context is a mutable runtime state

import React, { createContext, useContext, useState } from "react"

export type BusStop = {
  id: string
  name: string
  coords: [number, number]
}


//Shape of the context value
type Ctx = {
  stops: BusStop[]
  //React state updater function that either accepts a new array of busStops or will accept the previous state and return a new array of busStops
  //The Dispatch turns it into a callable function 
  setStops: React.Dispatch<React.SetStateAction<BusStop[]>>
}

//Create the context (solves the problem of prop drilling)
const BusStopsContext = createContext<Ctx | undefined>(undefined)

export function BusStopsProvider({ children }: { children: React.ReactNode }) {
  const [stops, setStops] = useState<BusStop[]>([])
  return <BusStopsContext.Provider value={{ stops, setStops }}>{children}</BusStopsContext.Provider>
}

export function useBusStops() {
  const ctx = useContext(BusStopsContext)
  if (!ctx) throw new Error("useBusStops must be used inside BusStopsProvider")
  return ctx
}