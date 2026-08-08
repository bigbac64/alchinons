import { Component } from "react";
import Button from "./ui/Button/Button.jsx";
import Panel from "./ui/Panel.jsx";
import SectionHeader from "./ui/SectionHeader.jsx";

/**
 * Filet de sécurité global. Sans lui, une erreur de rendu React démonte tout
 * l'arbre en silence (`<div id="root">` reste vide, rien ne l'indique à
 * l'écran), et une promesse rejetée sans `.catch()` (ex. un handler d'event
 * moteur qui suppose une forme de payload incorrecte) ne laisse de trace
 * que dans la console. Ce composant capture les deux catégories et affiche
 * toujours un écran d'erreur visible plutôt qu'une page vide.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleRejection);
  }

  handleWindowError = (event) => {
    this.setState({ error: event.error ?? new Error(event.message) });
  };

  handleRejection = (event) => {
    const { reason } = event;
    console.error(reason);
    this.setState({ error: reason instanceof Error ? reason : new Error(String(reason)) });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <Panel className="w-full max-w-lg border-rose-700/50 bg-rose-950/20 p-6">
          <SectionHeader className="text-rose-300">Erreur</SectionHeader>
          <p className="mt-2 text-slate-100">Une erreur inattendue a interrompu l'affichage.</p>
          <p className="mt-1 text-sm text-rose-300">{error.message}</p>
          <details className="mt-3 text-xs text-slate-500">
            <summary className="cursor-pointer select-none">Détails techniques</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">{error.stack}</pre>
          </details>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Recharger
          </Button>
        </Panel>
      </div>
    );
  }
}
