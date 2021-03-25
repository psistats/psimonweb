import React, { useContext } from 'react';
import './App.css';
import { observer } from 'mobx-react';
import psistatsContext from './store';

import Host from './Host';
const App = observer(() => {

  const state = useContext(psistatsContext);

  const { cpu_usage, hosts, host_alive } = state;

  return (
    <div className="container">
    { hosts.map((host) => {
      return (
        <Host hostname={host} cpu={cpu_usage[host]} alive={host_alive[host]} key={host}/>
      )})
    }
    </div>
  );
});

export default App;