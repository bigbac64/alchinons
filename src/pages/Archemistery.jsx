import React, {useCallback, useEffect, useState} from 'react';
import {cx} from "../utils/classNames.js"
import ArcheTable from "../components/craft/ArcheTable.jsx";
import Inventory from "../components/inventory/Inventory.jsx";
import {useInventory} from "../providers/InventoryProvider.jsx";
import Button from "../components/ui/Button/Button.jsx";
import Panel from "../components/ui/Panel.jsx";
import {archimistCraft} from "../api/engine.js";

const Archemistery = (props) => {
  const {className, children, ...other} = props;
  const {player} = useInventory();

  const [resources, setResources] = useState(Array(3).fill(undefined))
  const [errors, setErrors] = useState("")
  const [crafting, setCrafting] = useState(false)
  const [result, setResult] = useState(undefined)

  function handleSelect(resource, _) {
    if(resource.quantity === 0) {
      setErrors("Tout les emplacements ont été remplis")
      return
    }
    setResources(s => {
      const index = s.indexOf(undefined)

      if (index !== -1) {
        resource.quantity -= 1
        s[index] = {name: resource.name};
      } else {
        setErrors("Tout les emplacements ont été remplis")
      }

      return [...s]
    })
  }

  function getAnimated(animation){

  }

  useEffect(() => {
    const unlisten = setTimeout(() => {
      if(errors) setErrors("")
    }, 1200)
    return () => clearTimeout(unlisten)
  }, [errors]);

  const handleCraft = useCallback(() => {
    if (resources.some(r => !r)) {
      setErrors("Il manque des ressources dans cette table");
      return
    }
    setCrafting(true)
    archimistCraft(resources.map(r => r.name), "player").then(setResult).catch(setErrors)
  }, [resources])

  const eraseSlot = (index) => {
    setResources(s => s.map(
      (r, i) => i === index ? undefined : r
    ))
    setCrafting(false)
  }

  return (
    <div className={cx("mx-auto max-w-5xl px-6 py-10 flex flex-col gap-3", className)}>
      <div>
        <h1 className="text-5xl font-bold text-white">
          Objectif
        </h1>

        <p className="mt-2 text-slate-400">
          Hop on travaille ici !
        </p>
      </div>

      <div className={"flex flex-col gap-3"}>
        <div className={"flex gap-3"}>
          <ArcheTable
            className={"max-w-2xl"}
            resources={resources}
            action={crafting}
            result={result}
            onEraseSlot={eraseSlot}
            onAnimate={getAnimated}
            count={3}
          />

          <Inventory className={"grow"} inventory={player} name={"Joueur"} onSelect={handleSelect}/>
        </div>
        <Panel className="mt-3 flex items-center justify-between gap-4 px-4 py-2.5">
          <span className={`text-sm ${errors ? "text-red-300" : "text-slate-300"}`}>
            {errors || `Prêt à créer`}
          </span>
          <Button onClick={handleCraft} disabled={crafting}>
            {crafting ? "…" : "Générer"}
          </Button>
        </Panel>
      </div>
    </div>
  );
}

export default Archemistery;