"use client"

import {DividedHeader} from "@/components/DividedHeader";
import {useState} from "react";

export default function Home() {
  const [bar1Length, setBar1Length] = useState("0");
  const [bar2Length, setBar2Length] = useState("0");
  const [armDistance, setArmDistance] = useState("0");
  const [backdropAngle, setBackdropAngle] = useState("0");

  return (
      <main className={"flex h-full w-full flex-col justify-between pt-6 pb-12 overflow-x-hidden"}>
        <DividedHeader title={"Gear Ratio Finder"} subtitle={"By Michael Lachut"}/>
        <div className={"grid grid-cols-2 ml-12 mt-8"}>
          <div className={"grid grid-cols-5"}>
            <p className={"my-auto col-span-3"}>Bar 1 length: </p>
            <input className={"m-2"} inputMode={"decimal"} type={"number"} step={0.5} value={bar1Length} placeholder={"inches"} onChange={event => setBar1Length(event.target.value)}/>
            <p className={"my-auto"}>(inches)</p>

            <p className={"my-auto col-span-3"}>Bar 2 length: </p>
            <input className={"m-2"} inputMode={"decimal"} type={"number"} step={0.5} value={bar2Length} placeholder={"inches"} onChange={event => setBar2Length(event.target.value)}/>
            <p className={"my-auto"}>(inches)</p>

            <p className={"my-auto col-span-3"}>Distance from backdrop to arm rotation axis: </p>
            <input className={"m-2"} inputMode={"decimal"} type={"number"} step={0.5} value={armDistance} placeholder={"inches"} onChange={event => setArmDistance(event.target.value)}/>
            <p className={"my-auto"}>(inches)</p>

            <p className={"my-auto col-span-3"}>Backdrop Angle: </p>
            <input className={"m-2"} inputMode={"decimal"} type={"number"} step={0.5} value={backdropAngle} placeholder={"degrees"} onChange={event => setBackdropAngle(event.target.value)}/>
            <p className={"my-auto"}>(degrees)</p>
          </div>
          <div className={`flex-row ${areValuesValid(bar1Length, bar2Length, armDistance, backdropAngle) ? 'flex' : 'hidden'}`}>
            <p className={"text-green-400"}>Best gear ratio: {calculateBestGearRatio(parseFloat(bar1Length), parseFloat(bar2Length), parseFloat(armDistance), parseFloat(backdropAngle))}</p>
          </div>
          <div className={`${areValuesValid(bar1Length, bar2Length, armDistance, backdropAngle) ? 'hidden' : 'flex'}`}>
            <p className={"text-red-500"}>Error: all values must be positive, non-zero numbers</p>
          </div>
        </div>
      </main>
  )
}

function areValuesValid(bar1Length: string, bar2Length: string, armDistance: string, backdropAngle: string): boolean {
  const bar1 = parseFloat(bar1Length);
  const bar2 = parseFloat(bar2Length);
  const arm = parseFloat(armDistance);
  const angle = parseFloat(backdropAngle);

  return bar1 > 0 && bar2 > 0 && arm > 0 && angle > 0;
}

/**
 * Calculates the angle of bar 2 based on the angle of bar 1 and the gear ratio.
 * @param bar1Angle The angle of bar 1. 0 = straight up, 90 = flat.
 * @param gearRatio The gear ratio of the arm.
 */
function calculateBar2Angle(bar1Angle: number, gearRatio: number): number {
  return 90 + (gearRatio * (90 - bar1Angle));
}

/**
 * Calculates the height of bar 2 based on the angle of bar 2 and the length of bar 2.
 * @param bar1Angle The angle of bar 1. 0 = straight up, 90 = flat.
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param gearRatio The gear ratio of the arm.
 */
function calculateBar2Height(bar1Angle: number, bar1Length: number, bar2Length: number, gearRatio: number): number {
  const bar2Angle = calculateBar2Angle(bar1Angle, gearRatio);
  const bar1Height = Math.sin(bar1Angle) * bar1Length;
  const bar2Height = Math.sin(bar2Angle) * bar2Length;
  return bar1Height + bar2Height;
}

/**
 * Calculates the horizontal distance between the arm rotation axis and the backdrop.
 * @param bar1Angle The angle of bar 1. 0 = straight up, 90 = flat.
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param gearRatio The gear ratio of the arm.
 */
function calculateHorizontalDistance(bar1Angle: number, bar1Length: number, bar2Length: number, gearRatio: number): number {
  const bar2Angle = calculateBar2Angle(bar1Angle, gearRatio);
  const bar1Len = Math.cos(bar1Angle) * bar1Length;
  const bar2Len = Math.cos(bar2Angle) * bar2Length;
  return bar1Len + bar2Len;
}

/**
 * Determines if the arm is touching the backdrop.
 * @param bar1Angle The angle of bar 1. 0 = straight up, 90 = flat.
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param gearRatio The gear ratio of the arm.
 * @param backdropAngle The angle of the backdrop. 0 = flat, 90 = straight up.
 * @param pivotOffset The distance from the arm rotation axis to the base of the backdrop.
 */
function isTouchingBackdrop(bar1Angle: number, bar1Length: number, bar2Length: number, gearRatio: number, backdropAngle: number, pivotOffset: number): boolean {
  const bar2Angle = calculateBar2Angle(bar1Angle, gearRatio);
  const bar1Height = Math.sin(bar1Angle) * bar1Length;
  const bar2Height = Math.sin(bar2Angle) * bar2Length;
  const bar1Len = Math.cos(bar1Angle) * bar1Length;
  const bar2Len = Math.cos(bar2Angle) * bar2Length;
  const armHeight = bar1Height + bar2Height;
  const armLen = bar1Len + bar2Len;
  const backdropHeight = Math.sin(backdropAngle) * pivotOffset;
  const backdropLen = Math.cos(backdropAngle) * pivotOffset;
  return armHeight >= backdropHeight && armLen >= backdropLen;
}

/**
 * Calculates the best gear ratio for the arm so that it can reach the backdrop.
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param armDistance The distance from the arm rotation axis to the base of the backdrop.
 * @param backdropAngle The angle of the backdrop. 0 = flat, 90 = straight up.
 */
function calculateBestGearRatio(bar1Length: number, bar2Length: number, armDistance: number, backdropAngle: number): number {
  let bestRatio = 0;
  let bestHeight = 0;
  let bestLen = 0;
  for (let ratio = 0; ratio < 10; ratio += 0.01) {
    const bar1Angle = 90 - (ratio * 90);
    const bar2Angle = calculateBar2Angle(bar1Angle, ratio);
    const bar1Height = Math.sin(bar1Angle) * bar1Length;
    const bar2Height = Math.sin(bar2Angle) * bar2Length;
    const bar1Len = Math.cos(bar1Angle) * bar1Length;
    const bar2Len = Math.cos(bar2Angle) * bar2Length;
    const armHeight = bar1Height + bar2Height;
    const armLen = bar1Len + bar2Len;
    const backdropHeight = Math.sin(backdropAngle) * armDistance;
    const backdropLen = Math.cos(backdropAngle) * armDistance;
    if (armHeight >= backdropHeight && armLen >= backdropLen) {
      if (armHeight > bestHeight && armLen > bestLen) {
        bestRatio = ratio;
        bestHeight = armHeight;
        bestLen = armLen;
      }
    }
  }
  return bestRatio;
}