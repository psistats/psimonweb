import React, { useContext } from 'react';
import { Sparklines, SparklinesLine, SparklinesBars, SparklinesCurve, SparklinesSpots } from './sparklines/Sparklines';

export interface HostProps {
  hostname: string,
  cpu: number[],
  alive: boolean
}

const Host = (props: HostProps) => {

  let className = 'host';

  if (props.alive === false) {
    className += ' dead-host';
  }

  return (
    <div className={className}>
      <h1>{ props.hostname }</h1>
      <p className="cpu">cpu: { props.cpu[props.cpu.length-1].toFixed(2) }% </p>
      <div style={{ width: '100%', backgroundColor: '#030303'}}>
                  <Sparklines data={props.cpu} min={0} max={100} height={50} margin={0}>
                  <SparklinesBars />
          </Sparklines>
      </div>
    </div>
  );
}

export default Host;