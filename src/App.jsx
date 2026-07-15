import {useEffect, useState} from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import {listen} from "@tauri-apps/api/event";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [inventory, setInventory] = useState({});
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke("engine", { command: "Gather" }).then(() => console.log("gather terminé"))
    setGreetMsg(await invoke("greet", { name }));
  }

  useEffect(() => {
    const register_listener = listen("inventory_update", (ev) => {
        console.log(ev.payload);
        setInventory(ev.payload);
      }
    )

    return () => {
      register_listener.then((fn) => fn()); // se désabonner au démontage du composant
    };
  })

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <p>{inventory?.items && inventory?.items.map(({name, quantity}) => <>
          <span>{name}</span>
          <span>{quantity}</span>
        </>
      )}</p>
    </main>
  );
}

export default App;
