/**
 * CS2 Assistant - Application Translation Dictionaries
 * File: src/renderer/i18n/translations.ts
 *
 * Provides complete localized UI copy across:
 * - en (English - Default)
 * - pt-BR (Português do Brasil)
 * - es (Español)
 */

import type { Language } from './types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Navigation
    'app.brand': 'jco cs2 assistant',
    'nav.lineups': 'Lineups',
    'nav.statsHistory': 'Stats & History',
    'nav.overlayCenter': 'Overlay Center',
    'nav.settings': 'Settings',
    'nav.github': 'github/jcopapi',

    // Maps
    'map.all': 'All Maps',
    'map.de_mirage': 'Mirage',
    'map.de_inferno': 'Inferno',
    'map.de_dust2': 'Dust II',
    'map.de_nuke': 'Nuke',
    'map.de_ancient': 'Ancient',
    'map.de_anubis': 'Anubis',

    // Faction & Side Filters
    'side.all': 'All',
    'side.t': 'Terrorist (T)',
    'side.ct': 'Counter-Terrorist (CT)',

    // Utility Filters
    'util.all': 'All Utilities',
    'util.smoke': 'Smokes',
    'util.flash': 'Flashes',
    'util.moly': 'Molotovs',
    'util.he': 'HE Grenades',

    // Lineups Explorer
    'explorer.searchPlaceholder': 'Search pixels, callouts, throw...',
    'explorer.emptyStateTitle': 'No pixels loaded',
    'explorer.emptyStateSubtitle': 'Import standard offline map packs or drop custom .zip packs into "Custom Lineups".',
    'explorer.importPacksBtn': 'Import Packs',
    'explorer.addCustomBtn': 'Add Custom Pixel',
    'explorer.lineupsCount': 'Pixels',
    'explorer.clearAll': 'Clear Lineups',

    // Inspector
    'inspector.selectPrompt': 'Select a lineup from the list to inspect details',
    'inspector.tabAim': 'AIM RETICLE',
    'inspector.tabResult': 'LANDING RESULT',
    'inspector.standPosition': 'Stand Position',
    'inspector.targetDestination': 'Target Landing',
    'inspector.throwTechnique': 'Throw Technique',
    'inspector.movement': 'Movement',
    'inspector.addToPlan': 'Add to Plan',
    'inspector.inPlan': 'In Active Plan',
    'inspector.openOverlay': 'Preview in Overlay',
    'inspector.pinToOverlay': 'Pin to Overlay',
    'inspector.pinned': 'Pinned',
    'inspector.technique.jumpthrow': 'Jumpthrow',
    'inspector.technique.standing': 'Standing Left-Click',
    'inspector.technique.running': 'Run + Throw',
    'inspector.technique.walk': 'Walk + Throw',
    'inspector.technique.crouch': 'Crouch Throw',

    // Tactical Plans
    'plan.title': 'Tactical Plans',
    'plan.active': 'ACTIVE',
    'plan.noPlans': 'No plans created for this map.',
    'plan.createBtn': 'New Plan',
    'plan.shareBtn': 'Share Code',
    'plan.importBtn': 'Import Code',
    'plan.syncBtn': 'Sync to Overlay',
    'plan.copied': 'Copied code to clipboard!',
    'plan.emptySteps': 'Plan is empty. Click "+" on any pixel card to add.',
    'plan.step': 'Step',
    'plan.steps': 'steps',

    // Offline Pack Modal
    'packModal.title': 'Pixel Packs (.ZIP)',
    'packModal.subtitle': '100% offline — no internet required. Load curated map packs or import custom community zips.',
    'packModal.tabPacks': 'Map Packs',
    'packModal.tabImport': 'Import .ZIP',
    'packModal.tabExport': 'Export',
    'packModal.tabManage': 'Manage',
    'packModal.install': 'Install Pack',
    'packModal.installed': 'Installed',
    'packModal.reinstall': 'Reinstall',
    'packModal.exportZip': 'Export to .ZIP',
    'packModal.clearDatabase': 'Clear All Loaded Lineups',
    'packModal.clearConfirm': 'Are you sure you want to clear all loaded lineups?',
    'packModal.selectZip': 'Select .ZIP File',
    'packModal.dropZip': 'or drag and drop your .zip pixel pack here',
    'packModal.curatedTitle': 'Official Offline Map Packs',
    'packModal.curatedDesc': 'Curated high-resolution lineups from in-game CS2 competitive play:',

    // Bomb Timer
    'bomb.planted': 'BOMB PLANTED',
    'bomb.defuseNoKit': 'IMPOSSIBLE DEFUSE WITHOUT KIT (<10s)',
    'bomb.defuseKit': 'IMPOSSIBLE TO DEFUSE (<5s)',

    // Player Stats & History
    'stats.title': 'Player Performance & Match Records',
    'stats.subtitle': 'Local telemetry from Counter-Strike 2 GSI and match history',
    'stats.kd': 'K/D Ratio',
    'stats.kills': 'Total Kills',
    'stats.deaths': 'Total Deaths',
    'stats.adr': 'Avg Damage / Round (ADR)',
    'stats.utilityDmg': 'Utility Damage',
    'stats.flashAssists': 'Flash Assists',
    'stats.matches': 'Matches Recorded',
    'stats.winRate': 'Win Rate',
    'stats.recentMatches': 'Recent Matches',
    'stats.victory': 'VICTORY',
    'stats.defeat': 'DEFEAT',
    'stats.practiceRecommended': 'Recommended Practice',

    // Overlay Center
    'overlay.matchCockpit': 'In-Match Overlay Center',
    'overlay.loadPixels': 'Load Pixels',
    'overlay.pixelsLoaded': 'Pixels Loaded',
    'overlay.hotkeyHint': 'Press Hotkey to toggle in-game crosshair alignment',
    'overlay.alignOpacity': 'Align Opacity',

    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.loading': 'Loading...',
  },

  'pt-BR': {
    // Top Bar & Navigation
    'app.brand': 'jco cs2 assistant',
    'nav.lineups': 'Pixels',
    'nav.statsHistory': 'Estatísticas & Histórico',
    'nav.overlayCenter': 'Centro de Overlays',
    'nav.settings': 'Configurações',
    'nav.github': 'github/jcopapi',

    // Maps
    'map.all': 'Todos os Mapas',
    'map.de_mirage': 'Mirage',
    'map.de_inferno': 'Inferno',
    'map.de_dust2': 'Dust II',
    'map.de_nuke': 'Nuke',
    'map.de_ancient': 'Ancient',
    'map.de_anubis': 'Anubis',

    // Faction & Side Filters
    'side.all': 'Todos',
    'side.t': 'Terroristas (T)',
    'side.ct': 'Contra-Terroristas (CT)',

    // Utility Filters
    'util.all': 'Todas as Granadas',
    'util.smoke': 'Smokes',
    'util.flash': 'Bangs',
    'util.moly': 'Molotovs',
    'util.he': 'Granadas HE',

    // Lineups Explorer
    'explorer.searchPlaceholder': 'Buscar pixels, posições, locais...',
    'explorer.emptyStateTitle': 'Nenhum pixel carregado',
    'explorer.emptyStateSubtitle': 'Importe os pacotes padrões offline por mapa ou adicione arquivos .zip na pasta "Custom Lineups".',
    'explorer.importPacksBtn': 'Importar Pacotes',
    'explorer.addCustomBtn': 'Novo Pixel',
    'explorer.lineupsCount': 'Pixels',
    'explorer.clearAll': 'Limpar Pixels',

    // Inspector
    'inspector.selectPrompt': 'Selecione um pixel da lista para inspecionar os detalhes',
    'inspector.tabAim': 'MIRA DE ALINHAMENTO',
    'inspector.tabResult': 'ONDE CAI',
    'inspector.standPosition': 'Onde Ficar (Posição)',
    'inspector.targetDestination': 'Destino da Granada',
    'inspector.throwTechnique': 'Técnica de Lançamento',
    'inspector.movement': 'Movimento',
    'inspector.addToPlan': 'Adicionar ao Plano',
    'inspector.inPlan': 'No Plano Ativo',
    'inspector.openOverlay': 'Ver no Overlay',
    'inspector.pinToOverlay': 'Fixar no Jogo',
    'inspector.pinned': 'Fixado',
    'inspector.technique.jumpthrow': 'Jumpthrow (Pulo + Lançamento)',
    'inspector.technique.standing': 'Parado (Botão Esquerdo)',
    'inspector.technique.running': 'Correndo + Lançamento',
    'inspector.technique.walk': 'Andando + Lançamento',
    'inspector.technique.crouch': 'Agachado (Crouch)',

    // Tactical Plans
    'plan.title': 'Planos Táticos',
    'plan.active': 'ATIVO NO JOGO',
    'plan.noPlans': 'Nenhum plano criado para este mapa.',
    'plan.createBtn': 'Novo Plano',
    'plan.shareBtn': 'Código',
    'plan.importBtn': 'Importar Código',
    'plan.syncBtn': 'Sincronizar no Overlay',
    'plan.copied': 'Código copiado para a área de transferência!',
    'plan.emptySteps': 'Plano vazio. Clique no "+" de qualquer pixel para adicionar.',
    'plan.step': 'Passo',
    'plan.steps': 'passos',

    // Offline Pack Modal
    'packModal.title': 'Pacotes de Pixel (.ZIP)',
    'packModal.subtitle': '100% offline — sem internet. Carregue pacotes padrão por mapa ou importe .zips da comunidade.',
    'packModal.tabPacks': 'Pacotes por Mapa',
    'packModal.tabImport': 'Importar .ZIP',
    'packModal.tabExport': 'Exportar',
    'packModal.tabManage': 'Gerenciar',
    'packModal.install': 'Instalar Pacote',
    'packModal.installed': 'Instalado',
    'packModal.reinstall': 'Reinstalar',
    'packModal.exportZip': 'Exportar para .ZIP',
    'packModal.clearDatabase': 'Limpar Todos os Pixels Carregados',
    'packModal.clearConfirm': 'Tem certeza que deseja apagar todos os pixels carregados?',
    'packModal.selectZip': 'Selecionar Arquivo .ZIP',
    'packModal.dropZip': 'ou arraste e solte o pacote .zip aqui',
    'packModal.curatedTitle': 'Pacotes Oficiais Offline por Mapa',
    'packModal.curatedDesc': 'Pixels autênticos em alta definição extraídos de partidas reais no CS2:',

    // Bomb Timer
    'bomb.planted': 'BOMBA PLANTADA',
    'bomb.defuseNoKit': 'IMPOSSÍVEL DEFUSAR SEM KIT (<10s)',
    'bomb.defuseKit': 'IMPOSSÍVEL DEFUSAR (<5s)',

    // Player Stats & History
    'stats.title': 'Desempenho & Histórico de Partidas',
    'stats.subtitle': 'Telemetria local oficial do CS2 GSI e histórico de confrontos',
    'stats.kd': 'K/D Ratio',
    'stats.kills': 'Abates Totais',
    'stats.deaths': 'Mortes Totais',
    'stats.adr': 'Dano Médio / Round (ADR)',
    'stats.utilityDmg': 'Dano com Granadas',
    'stats.flashAssists': 'Assistências de Bang',
    'stats.matches': 'Partidas Gravadas',
    'stats.winRate': 'Taxa de Vitória',
    'stats.recentMatches': 'Partidas Recentes',
    'stats.victory': 'VITÓRIA',
    'stats.defeat': 'DERROTA',
    'stats.practiceRecommended': 'Treino Recomendado',

    // Overlay Center
    'overlay.matchCockpit': 'Centro de Overlays na Partida',
    'overlay.loadPixels': 'Carregar Pixels',
    'overlay.pixelsLoaded': 'Pixels Carregados',
    'overlay.hotkeyHint': 'Segure a tecla de atalho para alinhar a mira no jogo',
    'overlay.alignOpacity': 'Opacidade de Alinhamento',

    // Common
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.delete': 'Excluir',
    'common.close': 'Fechar',
    'common.loading': 'Carregando...',
  },

  es: {
    // Top Bar & Navigation
    'app.brand': 'jco cs2 assistant',
    'nav.lineups': 'Lineups',
    'nav.statsHistory': 'Estadísticas e Historial',
    'nav.overlayCenter': 'Centro de Overlays',
    'nav.settings': 'Ajustes',
    'nav.github': 'github/jcopapi',

    // Maps
    'map.all': 'Todos los Mapas',
    'map.de_mirage': 'Mirage',
    'map.de_inferno': 'Inferno',
    'map.de_dust2': 'Dust II',
    'map.de_nuke': 'Nuke',
    'map.de_ancient': 'Ancient',
    'map.de_anubis': 'Anubis',

    // Faction & Side Filters
    'side.all': 'Todos',
    'side.t': 'Terroristas (T)',
    'side.ct': 'Contra-Terroristas (CT)',

    // Utility Filters
    'util.all': 'Todas las Granadas',
    'util.smoke': 'Humos',
    'util.flash': 'Cegadoras',
    'util.moly': 'Molotovs',
    'util.he': 'Granadas HE',

    // Lineups Explorer
    'explorer.searchPlaceholder': 'Buscar lineups, posiciones, destinos...',
    'explorer.emptyStateTitle': 'Sin lineups cargados',
    'explorer.emptyStateSubtitle': 'Importa paquetes estándar offline por mapa o añade archivos .zip en "Custom Lineups".',
    'explorer.importPacksBtn': 'Importar Paquetes',
    'explorer.addCustomBtn': 'Nuevo Lineup',
    'explorer.lineupsCount': 'Lineups',
    'explorer.clearAll': 'Borrar Lineups',

    // Inspector
    'inspector.selectPrompt': 'Selecciona un lineup de la lista para inspeccionar detalles',
    'inspector.tabAim': 'MIRA DE APUNTADO',
    'inspector.tabResult': 'DONDE CAE',
    'inspector.standPosition': 'Posición Inicial',
    'inspector.targetDestination': 'Destino de Granada',
    'inspector.throwTechnique': 'Técnica de Lanzamiento',
    'inspector.movement': 'Movimiento',
    'inspector.addToPlan': 'Añadir al Plan',
    'inspector.inPlan': 'En Plan Activo',
    'inspector.openOverlay': 'Ver en Overlay',
    'inspector.pinToOverlay': 'Fijar en Partida',
    'inspector.pinned': 'Fijado',
    'inspector.technique.jumpthrow': 'Jumpthrow',
    'inspector.technique.standing': 'De pie (Clic Izquierdo)',
    'inspector.technique.running': 'Correr + Lanzar',
    'inspector.technique.walk': 'Caminar + Lanzar',
    'inspector.technique.crouch': 'Agachado (Crouch)',

    // Tactical Plans
    'plan.title': 'Planes Tácticos',
    'plan.active': 'ACTIVO EN PARTIDA',
    'plan.noPlans': 'No hay planes creados para este mapa.',
    'plan.createBtn': 'Nuevo Plan',
    'plan.shareBtn': 'Código',
    'plan.importBtn': 'Importar Código',
    'plan.syncBtn': 'Sincronizar con Overlay',
    'plan.copied': '¡Código copiado al portapapeles!',
    'plan.emptySteps': 'Plan vacío. Haz clic en "+" en cualquier tarjeta para añadir.',
    'plan.step': 'Paso',
    'plan.steps': 'pasos',

    // Offline Pack Modal
    'packModal.title': 'Paquetes de Lineups (.ZIP)',
    'packModal.subtitle': '100% offline — sin internet. Carga paquetes por mapa o importa .zips comunitarios.',
    'packModal.tabPacks': 'Paquetes por Mapa',
    'packModal.tabImport': 'Importar .ZIP',
    'packModal.tabExport': 'Exportar',
    'packModal.tabManage': 'Gestionar',
    'packModal.install': 'Instalar Paquete',
    'packModal.installed': 'Instalado',
    'packModal.reinstall': 'Reinstalar',
    'packModal.exportZip': 'Exportar a .ZIP',
    'packModal.clearDatabase': 'Borrar Todos los Lineups Cargados',
    'packModal.clearConfirm': '¿Estás seguro de que deseas borrar todos los lineups cargados?',
    'packModal.selectZip': 'Seleccionar Archivo .ZIP',
    'packModal.dropZip': 'o arrastra y suelta el paquete .zip aquí',
    'packModal.curatedTitle': 'Paquetes Oficiales Offline por Mapa',
    'packModal.curatedDesc': 'Lineups auténticos de alta resolución extraídos de partidas competitivas de CS2:',

    // Bomb Timer
    'bomb.planted': 'BOMBA PLANTADA',
    'bomb.defuseNoKit': 'IMPOSIBLE DESACTIVAR SIN KIT (<10s)',
    'bomb.defuseKit': 'IMPOSIBLE DESACTIVAR (<5s)',

    // Player Stats & History
    'stats.title': 'Rendimiento e Historial de Partidas',
    'stats.subtitle': 'Telemetría local oficial de CS2 GSI e historial de partidas',
    'stats.kd': 'K/D Ratio',
    'stats.kills': 'Bajas Totales',
    'stats.deaths': 'Muertes Totales',
    'stats.adr': 'Daño Medio / Ronda (ADR)',
    'stats.utilityDmg': 'Daño de Utilidad',
    'stats.flashAssists': 'Asistencias de Flash',
    'stats.matches': 'Partidas Registradas',
    'stats.winRate': 'Porcentaje de Victoria',
    'stats.recentMatches': 'Partidas Recientes',
    'stats.victory': 'VICTORIA',
    'stats.defeat': 'DERROTA',
    'stats.practiceRecommended': 'Entrenamiento Recomendado',

    // Overlay Center
    'overlay.matchCockpit': 'Centro de Overlays en Partida',
    'overlay.loadPixels': 'Cargar Lineups',
    'overlay.pixelsLoaded': 'Lineups Cargados',
    'overlay.hotkeyHint': 'Mantén presionada la tecla para alinear la mira',
    'overlay.alignOpacity': 'Opacidad de Alineación',

    // Common
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
  },
};
