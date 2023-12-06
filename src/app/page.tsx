"use client"

import {DividedHeader} from "@/components/DividedHeader";
import {useState} from "react";

export default function Home() {
  const [bar1Length, setBar1Length] = useState("0");
  const [bar2Length, setBar2Length] = useState("0");
  const [armDistance, setArmDistance] = useState("0");
  const [backdropAngle, setBackdropAngle] = useState("0");
  const [motorRPM, setMotorRPM] = useState("0");

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

            <p className={"my-auto col-span-3"}>Max motor rpm: </p>
            <input className={"m-2"} inputMode={"decimal"} type={"number"} step={10} value={motorRPM} placeholder={"rpm"} onChange={event => setMotorRPM(event.target.value)}/>
            <p className={"my-auto"}>(rpm)</p>
          </div>
          <div className={`flex-row ${areValuesValid(bar1Length, bar2Length, armDistance, backdropAngle, motorRPM) ? 'flex' : 'hidden'}`}>
            <p className={"text-green-400"}>Best gear ratio: {calculateBestGearRatio(parseFloat(bar1Length), parseFloat(bar2Length), parseFloat(armDistance), parseFloat(backdropAngle), parseFloat(motorRPM))}</p>
          </div>
          <div className={`${areValuesValid(bar1Length, bar2Length, armDistance, backdropAngle, motorRPM) ? 'hidden' : 'flex'}`}>
            <p className={"text-red-500"}>Error: all values must be positive, non-zero numbers</p>
          </div>
        </div>
      </main>
  )
}

function areValuesValid(bar1Length: string, bar2Length: string, armDistance: string, backdropAngle: string, motorRPM: string): boolean {
  const bar1 = parseFloat(bar1Length);
  const bar2 = parseFloat(bar2Length);
  const arm = parseFloat(armDistance);
  const angle = parseFloat(backdropAngle);
  const rpm = parseFloat(motorRPM);

  return bar1 > 0 && bar2 > 0 && arm > 0 && angle > 0 && rpm > 0;
}

/**
 * Calculates the height of bar 2 based on the angle of bar 2 and the length of bar 2.
 * @param t time
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param gearRatio The gear ratio of the arm.
 * @param armDistance The distance from the arm rotation axis to the base of the backdrop.
 * @param motorRPM The RPM of the motor.
 */
function calculateVerticalDistance(t: number, bar1Length: number, bar2Length: number, gearRatio: number, armDistance: number, motorRPM: number): number {
  return bar2Length * Math.sin(t * gearRatio * ((motorRPM * Math.PI)/840)) + bar1Length * Math.sin((motorRPM * Math.PI * t) / 840)
}

/**
 * Calculates the horizontal distance between the arm rotation axis and the backdrop.
 * @param t time
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param gearRatio The gear ratio of the arm.
 * @param armDistance The distance from the arm rotation axis to the base of the backdrop.
 * @param motorRPM The RPM of the motor.
 */
function calculateHorizontalDistance(t: number, bar1Length: number, bar2Length: number, gearRatio: number, armDistance: number, motorRPM: number): number {
  return bar2Length * Math.cos(t * gearRatio * ((motorRPM * Math.PI)/840)) + bar1Length * Math.cos((motorRPM * Math.PI * t) / 840) + armDistance;
}

/**
 * Determines if the arm is touching the backdrop.
 * @param verticalDistance The vertical distance between the arm rotation axis and the backdrop.
 * @param horizontalDistance The horizontal distance between the arm rotation axis and the backdrop.
 * @param backdropAngle The angle of the backdrop. 0 = flat, 90 = straight up.
 */
function isTouchingBackdrop(verticalDistance: number, horizontalDistance: number, backdropAngle: number): boolean {
  let x = verticalDistance * Math.tan(backdropAngle * Math.PI / 180);
  return -horizontalDistance >= x;
}

/**
 * Calculates the best gear ratio for the arm so that it can reach the backdrop.
 * @param bar1Length The length of bar 1.
 * @param bar2Length The length of bar 2.
 * @param armDistance The distance from the arm rotation axis to the base of the backdrop.
 * @param backdropAngle The angle of the backdrop. 0 = flat, 90 = straight up.
 * @param motorRPM The RPM of the motor.
 */
function calculateBestGearRatio(bar1Length: number, bar2Length: number, armDistance: number, backdropAngle: number, motorRPM: number): number {
  let bestRatio = 0;
  let bestHeight = 0;
  let bestLen = 0;
  for (let ratio = 0; ratio < 10; ratio += 0.01) {
    // Evaluate the highest value of t where it touches the backdrop.
    for (let t = 0; t < 100; t += 0.01) {
      const verticalDistance = calculateVerticalDistance(t, bar1Length, bar2Length, ratio, armDistance, motorRPM);
      const horizontalDistance = calculateHorizontalDistance(t, bar1Length, bar2Length, ratio, armDistance, motorRPM);
      if (isTouchingBackdrop(verticalDistance, horizontalDistance, backdropAngle)) {
        if (verticalDistance > bestHeight) {
          bestHeight = verticalDistance;
          bestLen = horizontalDistance;
          bestRatio = ratio;
        }
        break;
      }
    }
  }
  return bestRatio;
}