/// Algorithmes purs du domaine `gather` : aucun ne mute `GameState` ni ne
/// s'inscrit dans le motif command/model/state/system/view (CMSSV, cf.
/// ARCHITECTURE_GUIDELINES.md §4.3) — ce sont des fonctions de calcul
/// réutilisables, isolées ici pour ne pas les faire passer à tort pour un
/// `System`.
pub mod loot;
