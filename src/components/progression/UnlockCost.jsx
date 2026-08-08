import Button from "../ui/Button/Button.jsx";
import ResourceIcon from "../ui/ResourceIcon.jsx";

/**
 * Coût du prochain palier d'un déblocage + bouton d'achat. Réutilisé par
 * l'écran "à débloquer" du Four et par le panneau d'agrandissement de carte
 * — la seule règle de jeu qu'il connaît est celle déjà résolue par le
 * moteur dans `cost`.
 * @param {{cost: {resource: string, quantity: number}[], label?: string, purchasing?: boolean, error?: string|null, onPurchase: () => void}} props
 */
export default function UnlockCost({ cost, label = "Débloquer", purchasing = false, error = null, onPurchase }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {cost.map(({ resource, quantity }) => (
          <span
            key={resource}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-surface-panel px-3 py-1.5 text-sm text-slate-300"
          >
            <ResourceIcon resource={resource} />
            {quantity}
          </span>
        ))}
      </div>
      <Button onClick={onPurchase} disabled={purchasing}>
        {purchasing ? "..." : label}
      </Button>
      {error && <p className="text-sm text-rose-400">Ressources insuffisantes pour {error}.</p>}
    </div>
  );
}
