export type Language = 'en' | 'fr';

export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      ncs: "Non-Conformances",
      actions: "Action Plan",
      settings: "Settings",
      guide: "User Guide",
      footer: "GFSI Compliance Tool"
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview of Quality Incidents for",
      filters: {
        title: "Filters",
        year: "Year",
        period: "Period",
        allYears: "All Years",
        allPeriods: "All Periods",
        allDepts: "All Departments",
        allSources: "All Sources",
        q1: "Q1 (Jan-Mar)",
        q2: "Q2 (Apr-Jun)",
        q3: "Q3 (Jul-Sep)",
        q4: "Q4 (Oct-Dec)"
      },
      kpi: {
        total: "Total Incidents",
        open: "Open",
        inProgress: "In Progress",
        closed: "Closed / Verified"
      },
      charts: {
        status: "Status Distribution",
        dept: "Incidents by Department",
        source: "Incidents by Source"
      }
    },
    list: {
      title: "Non-Conformances",
      subtitle: "Manage quality incidents and actions",
      new: "New Record",
      searchPlaceholder: "Search by title or reference...",
      filterAll: "All Statuses",
      empty: "No records found.",
      columns: {
        ref: "Reference",
        title: "Title",
        dept: "Department",
        status: "Status",
        date: "Date"
      }
    },
    actionsList: {
      title: "Global Action Plan",
      subtitle: "Track and manage all corrective and preventive actions",
      viewList: "List View",
      viewGantt: "Timeline View",
      filterDept: "All Departments",
      filterAssignee: "All Assignees",
      filterStatus: "All Statuses",
      columns: {
        desc: "Description",
        nc: "Related NC",
        assignee: "Assignee",
        deadline: "Deadline",
        status: "Status",
        progress: "Timeline"
      },
      empty: "No actions found matching your filters."
    },
    detail: {
      back: "Back",
      save: "Save Changes",
      delete: "Delete",
      deleted: "Record deleted",
      saved: "Changes saved successfully",
      tabs: {
        info: "Information",
        rca: "Root Cause (RCA)",
        actions: "Action Plan",
        files: "Attachments"
      },
      info: {
        desc: "Description",
        descPlaceholder: "Describe the non-conformance (Who, What, Where, When)...",
        date: "Date Occurred",
        severity: "Severity",
        status: "Status",
        dept: "Department",
        source: "Source",
        location: "Location"
      },
      rca: {
        method: "Analysis Method",
        method5W: "5 Whys (Linear)",
        methodFish: "Ishikawa / 6M (Systemic)",
        methodComb: "Combined (Deep Analysis)",
        aiHelp: "Use Gemini AI to analyze causes.",
        autoAnalyze: "Auto-Analyze",
        final: "Final Root Cause",
        finalPlaceholder: "The fundamental reason...",
        ishikawa: {
            man: "Man (People)",
            machine: "Machine (Equipment)",
            material: "Material",
            method: "Method (Process)",
            env: "Environment",
            measure: "Measurement"
        }
      },
      actions: {
        aiHelp: "Generate plan based on Root Cause.",
        suggest: "Suggest Actions",
        add: "Add Action",
        empty: "No actions defined yet.",
        placeholder: "Action description",
        assignee: "Assignee...",
        resources: "Resources (Budget, Tools...)",
        dates: "Start / Deadline",
        attach: "Attach Doc",
        status: "Status",
        type: "Type"
      },
      files: {
        upload: "Click to upload image or document",
        limit: "Stored locally (Max 2MB)",
        download: "Download"
      }
    },
    guide: {
        title: "User Guide & Methodology",
        subtitle: "Learn how to effectively manage Non-Conformances and perform Root Cause Analysis.",
        tabs: {
            app: "App Usage",
            rca: "RCA Methodology",
            examples: "Detailed Examples"
        },
        rcaTitle: "How to perform a Root Cause Analysis",
        why5: "The 5 Whys",
        why5Desc: "A simple but powerful tool for quickly uncovering the root of a problem. Ask 'Why?' five times until you reach the fundamental process failure.",
        fishbone: "Ishikawa (Fishbone / 6M)",
        fishboneDesc: "Used for more complex problems. It categorizes causes into 6 categories (Man, Machine, Method, Material, Measurement, Environment) to ensure no angle is missed.",
        
        // Expanded Guide Content
        fishboneDetails: {
          man: "Man: Is it a training issue? Fatigue? Lack of resources? (Avoid blaming the individual).",
          machine: "Machine: Maintenance issue? Calibration? Tooling wear? Wrong settings?",
          material: "Material: Raw material defect? Packaging issue? Contamination?",
          method: "Method: Is the procedure clear? Is it up to date? Was it followed? Is the process robust?",
          env: "Environment: Temperature, Humidity, Lighting, Noise, Space constraints.",
          measure: "Measurement: Gauge error? Sampling method? Inspection criteria?"
        },
        scenario1: {
          title: "Scenario: Listeria in Floor Drain",
          problem: "Positive Listeria spp. swab found in Packing Room drain #3.",
          analysis: "Analysis:",
          why1: "Why? Bacteria accumulated in the drain trap.",
          why2: "Why? The drain was not effectively cleaned during sanitation.",
          why3: "Why? The sanitation crew could not access the deep trap properly.",
          why4: "Why? The drain cover requires a special tool to open, which was missing.",
          root: "Root Cause: Inadequate tool management and drain design hinders effective sanitation access.",
          action: "Corrective Action: Implement 'Shadow Board' for tools. Redesign drain cover for easier access."
        },
        scenario2: {
          title: "Scenario: Wrong Expiration Date",
          problem: "Product shipped with 30 days shelf life instead of 60 days.",
          analysis: "Ishikawa Analysis:",
          man: "Man: Operator manually typed the date.",
          machine: "Machine: Date coder has no auto-date function.",
          method: "Method: No 'First Off' check performed by QC.",
          root: "Root Cause: Reliance on manual data entry without a verification step (Method & Machine failure).",
          action: "Preventive Action: Upgrade coder for auto-date. Mandate 'First Off' label verification."
        }
    },
    settings: {
      title: "Settings",
      subtitle: "Configure organization details and lists.",
      orgName: "Organization Name",
      apiKey: "Gemini API Key",
      apiKeyDesc: "Provide your Google Gemini API Key to enable AI features. The key is stored locally in your browser.",
      dept: "Departments",
      loc: "Locations",
      src: "Sources",
      users: "Users / Assignees",
      dataMgmt: "Data Management",
      dataDesc: "All data is stored in your browser's LocalStorage. To backup your data or transfer it to another device, use the Export/Import buttons below.",
      warning: "Warning: Clearing browser cache will delete all data if not exported.",
      export: "Export JSON",
      import: "Import JSON",
      importSuccess: "Data imported successfully",
      importError: "Invalid JSON file",
      overwrite: "Overwrite current data with {count} records from file?"
    },
    common: {
      loading: "Loading VISIcat...",
      aiLoading: "Thinking...",
      error: "Error",
      success: "Success",
      confirmDelete: "Are you sure you want to delete this record?",
      largeFile: "File is large (>2MB). This may fill up LocalStorage. Continue?",
      aiError: "AI Error: Check API Key or connection",
      rcaGenerated: "RCA Generated by Gemini!",
      actionsGenerated: "Actions Suggested by Gemini!",
      missingDesc: "Please enter a description first.",
      missingRoot: "Root cause is required for suggestions.",
      missingKey: "Please set your Gemini API Key in Settings to use this feature."
    },
    status: {
        "Open": "Open",
        "In Progress": "In Progress",
        "Closed": "Closed",
        "Verified": "Verified"
    },
    severity: {
        "Minor": "Minor",
        "Major": "Major",
        "Critical": "Critical"
    },
    actionType: {
        "Immediate": "Immediate",
        "Corrective": "Corrective",
        "Preventive": "Preventive"
    },
    actionStatus: {
        "Pending": "Pending",
        "In Progress": "In Progress",
        "Done": "Done",
        "Delayed": "Delayed"
    }
  },
  fr: {
    nav: {
      dashboard: "Tableau de Bord",
      ncs: "Non-Conformités",
      actions: "Plan d'Actions",
      settings: "Paramètres",
      guide: "Guide Utilisateur",
      footer: "Outil de Conformité GFSI"
    },
    dashboard: {
      title: "Tableau de Bord",
      subtitle: "Aperçu des incidents qualité pour",
      filters: {
        title: "Filtres",
        year: "Année",
        period: "Période",
        allYears: "Toutes années",
        allPeriods: "Toutes périodes",
        allDepts: "Tous départements",
        allSources: "Toutes sources",
        q1: "T1 (Jan-Mar)",
        q2: "T2 (Avr-Juin)",
        q3: "T3 (Juil-Sep)",
        q4: "T4 (Oct-Déc)"
      },
      kpi: {
        total: "Total Incidents",
        open: "Ouverts",
        inProgress: "En Cours",
        closed: "Clôturés / Vérifiés"
      },
      charts: {
        status: "Répartition par Statut",
        dept: "Incidents par Département",
        source: "Incidents par Source"
      }
    },
    list: {
      title: "Non-Conformités",
      subtitle: "Gérer les incidents qualité et actions",
      new: "Nouveau",
      searchPlaceholder: "Rechercher par titre ou référence...",
      filterAll: "Tous les statuts",
      empty: "Aucun enregistrement trouvé.",
      columns: {
        ref: "Référence",
        title: "Titre",
        dept: "Département",
        status: "Statut",
        date: "Date"
      }
    },
    actionsList: {
      title: "Plan d'Actions Global",
      subtitle: "Suivre et gérer toutes les actions correctives et préventives",
      viewList: "Vue Liste",
      viewGantt: "Vue Chronologique",
      filterDept: "Tous Départements",
      filterAssignee: "Tous Responsables",
      filterStatus: "Tous Statuts",
      columns: {
        desc: "Description",
        nc: "NC Liée",
        assignee: "Responsable",
        deadline: "Échéance",
        status: "Statut",
        progress: "Chronologie"
      },
      empty: "Aucune action trouvée correspondant à vos filtres."
    },
    detail: {
      back: "Retour",
      save: "Sauvegarder",
      delete: "Supprimer",
      deleted: "Enregistrement supprimé",
      saved: "Modifications enregistrées",
      tabs: {
        info: "Informations",
        rca: "Cause Racine (RCA)",
        actions: "Plan d'Action",
        files: "Pièces Jointes"
      },
      info: {
        desc: "Description",
        descPlaceholder: "Décrivez la non-conformité (Qui, Quoi, Où, Quand)...",
        date: "Date de survenue",
        severity: "Sévérité",
        status: "Statut",
        dept: "Département",
        source: "Source",
        location: "Lieu"
      },
      rca: {
        method: "Méthode d'analyse",
        method5W: "5 Pourquoi (Linéaire)",
        methodFish: "Ishikawa / 6M (Systémique)",
        methodComb: "Combinée (Analyse approfondie)",
        aiHelp: "Besoin d'aide ? Utilisez Gemini AI.",
        autoAnalyze: "Auto-Analyse",
        final: "Cause Racine Finale",
        finalPlaceholder: "La raison fondamentale...",
        ishikawa: {
            man: "Main d'Oeuvre",
            machine: "Matériel (Machine)",
            material: "Matière",
            method: "Méthode",
            env: "Milieu (Environnement)",
            measure: "Mesure"
        }
      },
      actions: {
        aiHelp: "Générer un plan basé sur la Cause Racine.",
        suggest: "Suggérer Actions",
        add: "Ajouter Action",
        empty: "Aucune action définie.",
        placeholder: "Description de l'action",
        assignee: "Responsable...",
        resources: "Ressources (Budget, Outils...)",
        dates: "Début / Fin",
        attach: "Joindre Doc",
        status: "Statut",
        type: "Type"
      },
      files: {
        upload: "Cliquez pour uploader image ou doc",
        limit: "Stocké localement (Max 2MB)",
        download: "Télécharger"
      }
    },
    guide: {
        title: "Guide & Méthodologie",
        subtitle: "Apprenez à gérer efficacement les NC et réaliser des analyses de causes.",
        tabs: {
            app: "Utilisation App",
            rca: "Méthodologie RCA",
            examples: "Exemples Détaillés"
        },
        rcaTitle: "Comment réaliser une Analyse de Cause (RCA)",
        why5: "Les 5 Pourquoi",
        why5Desc: "Un outil simple mais puissant pour trouver rapidement la racine d'un problème. Demandez 'Pourquoi ?' cinq fois jusqu'à atteindre la défaillance fondamentale du processus.",
        fishbone: "Ishikawa (Arrête de Poisson / 6M)",
        fishboneDesc: "Utilisé pour des problèmes complexes. Il classe les causes en 6 catégories (Main d'œuvre, Machine, Méthode, Matière, Mesure, Milieu) pour s'assurer qu'aucun angle n'est oublié.",
        
        // Expanded Guide Content
        fishboneDetails: {
          man: "Main d'œuvre : Formation insuffisante ? Fatigue ? Manque de ressources ? (Ne blâmez pas l'individu).",
          machine: "Machine : Problème de maintenance ? Calibration ? Usure de l'outil ? Mauvais réglages ?",
          material: "Matière : Défaut matière première ? Problème d'emballage ? Contamination ?",
          method: "Méthode : La procédure est-elle claire ? À jour ? Suivie ? Le processus est-il robuste ?",
          env: "Milieu : Température, Humidité, Éclairage, Bruit, Contraintes d'espace.",
          measure: "Mesure : Erreur de jauge ? Méthode d'échantillonnage ? Critères d'inspection ?"
        },
        scenario1: {
          title: "Scénario : Listeria dans un drain",
          problem: "Listeria spp. positive trouvée dans le drain #3 de la salle d'emballage.",
          analysis: "Analyse :",
          why1: "Pourquoi ? Bactéries accumulées dans le siphon.",
          why2: "Pourquoi ? Le drain n'a pas été efficacement nettoyé lors de la sanitation.",
          why3: "Pourquoi ? L'équipe de sanitation n'a pas pu accéder au fond du siphon.",
          why4: "Pourquoi ? Le couvercle du drain nécessite un outil spécial pour s'ouvrir, qui était manquant.",
          root: "Cause Racine : Gestion des outils inadéquate et conception du drain empêchant un accès facile pour le nettoyage.",
          action: "Action Corrective : Mettre en place un panneau d'ombre pour les outils. Redessiner le couvercle du drain."
        },
        scenario2: {
          title: "Scénario : Mauvaise Date d'Expiration",
          problem: "Produit expédié avec 30 jours de DLUO au lieu de 60 jours.",
          analysis: "Analyse Ishikawa :",
          man: "Main d'œuvre : L'opérateur a tapé la date manuellement.",
          machine: "Machine : Le codeur n'a pas de fonction de date automatique.",
          method: "Méthode : Aucun contrôle 'Première Pièce' effectué par le QC.",
          root: "Cause Racine : Dépendance à la saisie manuelle sans étape de vérification (Échec Méthode & Machine).",
          action: "Action Préventive : Mettre à jour le codeur pour l'auto-date. Rendre obligatoire la vérification 'Première Pièce'."
        }
    },
    settings: {
      title: "Paramètres",
      subtitle: "Configurer les détails de l'organisation et les listes.",
      orgName: "Nom de l'Organisation",
      apiKey: "Clé API Gemini",
      apiKeyDesc: "Renseignez votre clé API Google Gemini pour activer l'IA. La clé est stockée localement dans votre navigateur.",
      dept: "Départements",
      loc: "Lieux",
      src: "Sources",
      users: "Utilisateurs / Responsables",
      dataMgmt: "Gestion des Données",
      dataDesc: "Toutes les données sont stockées dans le LocalStorage du navigateur. Pour sauvegarder ou transférer, utilisez Export/Import.",
      warning: "Attention : Vider le cache supprimera les données non exportées.",
      export: "Exporter JSON",
      import: "Importer JSON",
      importSuccess: "Données importées avec succès",
      importError: "Fichier JSON invalide",
      overwrite: "Écraser les données actuelles avec {count} enregistrements ?"
    },
    common: {
      loading: "Chargement de VISIcat...",
      aiLoading: "Réflexion...",
      error: "Erreur",
      success: "Succès",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
      largeFile: "Fichier volumineux (>2MB). Cela peut remplir le LocalStorage. Continuer ?",
      aiError: "Erreur AI : Vérifiez la clé API ou la connexion",
      rcaGenerated: "RCA Générée par Gemini !",
      actionsGenerated: "Actions suggérées par Gemini !",
      missingDesc: "Veuillez d'abord entrer une description.",
      missingRoot: "La cause racine est requise pour les suggestions.",
      missingKey: "Veuillez configurer votre clé API Gemini dans les Paramètres."
    },
    status: {
        "Open": "Ouvert",
        "In Progress": "En Cours",
        "Closed": "Clôturé",
        "Verified": "Vérifié"
    },
    severity: {
        "Minor": "Mineure",
        "Major": "Majeure",
        "Critical": "Critique"
    },
    actionType: {
        "Immediate": "Immédiate",
        "Corrective": "Corrective",
        "Preventive": "Préventive"
    },
    actionStatus: {
        "Pending": "En Attente",
        "In Progress": "En Cours",
        "Done": "Fait",
        "Delayed": "Retardé"
    }
  }
};