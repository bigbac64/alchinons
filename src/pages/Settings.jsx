import Button from "../components/ui/Button/Button.jsx";
import {reset} from "../api/engine.js";
import {useAppContext} from "../providers/AppProviders.jsx";

function Settings() {
  const {resetState} = useAppContext()

  const handleDelete = () => {
    reset().then()
    resetState()
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-center">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <p className="mt-2 text-slate-500">À compléter.</p>

      <div className={"mt-3 w-full flex flex-col gap-3 justify-center"}>
        <p className={"flex flex-row justify-between"}>
          Supprimer la sauvegarde
          <Button onClick={handleDelete}>Reset</Button>
        </p>
      </div>
    </div>
  );
}

export default Settings;