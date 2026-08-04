export type JourneyLocale = "en-US" | "es-US" | "fr-FR" | "pt-BR" | "de-DE";

export type JourneyDay = {
  title: string;
  focus: string;
  reflection: string;
  strength: string;
  move: string;
  affirmation: string;
};

export type JourneyTrack = {
  code: JourneyLocale;
  language: string;
  languageEnglish: string;
  transcriptFileLabel: string;
  ui: {
    kicker: string;
    title: string;
    intro: string;
    complete: string;
    day: string;
    daysLabel: string;
    about: string;
    minutes: string;
    reflect: string;
    findStrength: string;
    heroMove: string;
    placeholder: string;
    previous: string;
    next: string;
    completeDay: string;
    updateContinue: string;
    journeyComplete: string;
    listen: string;
    stop: string;
    listening: string;
    downloadTranscript: string;
    transcriptHelp: string;
    voiceUnavailable: string;
    safety: string;
    safetyLink: string;
    keepTitle: string;
    keepCopy: string;
    downloadEntries: string;
    print: string;
    clear: string;
    clearConfirm: string;
    createdWith: string;
    transcriptTitle: string;
    focus: string;
    reflectionPrompt: string;
    strengthPrompt: string;
    movePrompt: string;
    affirmation: string;
    permission: string;
    browserVoice: string;
  };
  days: JourneyDay[];
};

export const JOURNEY_TRACKS: JourneyTrack[] = [
  {
    code: "en-US",
    language: "English",
    languageEnglish: "English",
    transcriptFileLabel: "English",
    ui: {
      kicker: "Free guided experience",
      title: "7 Days to a Stronger Hero Within",
      intro: "One focused reflection, one strength, and one achievable Hero Move each day. Your entries stay in this browser on this device.",
      complete: "complete",
      day: "Day",
      daysLabel: "Your seven days",
      about: "About",
      minutes: "minutes",
      reflect: "Reflect",
      findStrength: "Find the Strength",
      heroMove: "Today's Hero Move",
      placeholder: "Write the action in your own words…",
      previous: "Previous",
      next: "Next",
      completeDay: "Complete this day",
      updateContinue: "Update & continue",
      journeyComplete: "Journey complete",
      listen: "Listen to this day",
      stop: "Stop audio",
      listening: "Playing this day's transcript",
      downloadTranscript: "Download day transcript",
      transcriptHelp: "The download exactly matches the words read by the browser voice.",
      voiceUnavailable: "No matching device voice is available for this language. You can still read or download the transcript.",
      safety: "This journey supports reflection and self-improvement. It is not therapy or emergency support.",
      safetyLink: "Safety guidance",
      keepTitle: "Keep your journey",
      keepCopy: "Download a plain-text copy or print this page to PDF. Clear it whenever you choose.",
      downloadEntries: "Download my entries",
      print: "Print / save PDF",
      clear: "Clear journey",
      clearConfirm: "Clear all seven days from this device?",
      createdWith: "Created with Z-Girl: The Hero Within Reflection System.",
      transcriptTitle: "7-DAY HERO WITHIN JOURNEY — SPOKEN TRANSCRIPT",
      focus: "Focus",
      reflectionPrompt: "Reflection prompt",
      strengthPrompt: "Strength prompt",
      movePrompt: "Hero Move prompt",
      affirmation: "Affirmation",
      permission: "You can pause or stop at any time.",
      browserVoice: "Browser voice · no autoplay",
    },
    days: [
      { title: "Make Space", focus: "Pause before you push forward.", reflection: "What has been taking up the most space in your mind or heart?", strength: "What helps you feel even 5% more grounded?", move: "Create two quiet minutes today—breathe, stretch, pray, sit, or step outside.", affirmation: "I can create space before I choose my next move." },
      { title: "Name the Moment", focus: "Clear words create a clearer starting point.", reflection: "What feeling, challenge, or decision needs an honest name today?", strength: "What do you know now that you did not know before?", move: "Complete this sentence: “The real issue I want to address is…”", affirmation: "Naming my experience helps me work with it." },
      { title: "Look Beneath It", focus: "Curiosity is more useful than self-judgment.", reflection: "What pressure, need, fear, or expectation may be shaping this moment?", strength: "When have you handled something similar with care or courage?", move: "Write one fact, one feeling, and one need—without trying to fix them yet.", affirmation: "I can be curious about myself without tearing myself down." },
      { title: "Find Your Strength", focus: "Strength includes the support you can reach for.", reflection: "Which value, skill, relationship, or resource is available to you now?", strength: "What would someone who believes in you remind you about?", move: "Use one strength on purpose today, even in a small way.", affirmation: "I already carry strengths that can help me move forward." },
      { title: "Choose the Hero Move", focus: "Progress becomes possible when the next step is small and specific.", reflection: "What outcome matters most—and what is within your control?", strength: "Which strength from Day 4 belongs in this next step?", move: "Choose one action you can complete in 15 minutes or less.", affirmation: "My next move does not have to solve everything to matter." },
      { title: "Ask for Support", focus: "Connection can be an act of courage.", reflection: "Where would support, accountability, or another perspective help?", strength: "Who is a safe person, or what is a reliable resource, you can contact?", move: "Send one message, ask one question, or schedule one conversation.", affirmation: "Asking for support is a powerful Hero Move." },
      { title: "Reflect Forward", focus: "Notice what changed, then carry the learning with you.", reflection: "What shifted in your thoughts, feelings, choices, or relationships this week?", strength: "What strength did you practice most?", move: "Write your next seven-day commitment in one clear sentence.", affirmation: "I can learn from this week and keep moving with purpose." },
    ],
  },
  {
    code: "es-US",
    language: "Español",
    languageEnglish: "Spanish",
    transcriptFileLabel: "Espanol",
    ui: {
      kicker: "Experiencia guiada gratuita",
      title: "7 días para fortalecer el héroe que llevas dentro",
      intro: "Cada día incluye una reflexión enfocada, una fortaleza y un Movimiento Heroico alcanzable. Tus respuestas permanecen en este navegador y dispositivo.",
      complete: "completados",
      day: "Día",
      daysLabel: "Tus siete días",
      about: "Aproximadamente",
      minutes: "minutos",
      reflect: "Reflexiona",
      findStrength: "Encuentra la fortaleza",
      heroMove: "Movimiento Heroico de hoy",
      placeholder: "Escribe la acción con tus propias palabras…",
      previous: "Anterior",
      next: "Siguiente",
      completeDay: "Completar este día",
      updateContinue: "Actualizar y continuar",
      journeyComplete: "Recorrido completado",
      listen: "Escuchar este día",
      stop: "Detener audio",
      listening: "Reproduciendo la transcripción de este día",
      downloadTranscript: "Descargar transcripción del día",
      transcriptHelp: "La descarga coincide exactamente con las palabras leídas por la voz del navegador.",
      voiceUnavailable: "No hay una voz del dispositivo disponible para este idioma. Aún puedes leer o descargar la transcripción.",
      safety: "Este recorrido apoya la reflexión y el crecimiento personal. No es terapia ni ayuda de emergencia.",
      safetyLink: "Guía de seguridad",
      keepTitle: "Guarda tu recorrido",
      keepCopy: "Descarga una copia en texto o imprime esta página como PDF. Bórrala cuando quieras.",
      downloadEntries: "Descargar mis respuestas",
      print: "Imprimir / guardar PDF",
      clear: "Borrar recorrido",
      clearConfirm: "¿Borrar los siete días de este dispositivo?",
      createdWith: "Creado con Z-Girl: El Sistema de Reflexión del Héroe Interior.",
      transcriptTitle: "RECORRIDO DE 7 DÍAS DEL HÉROE INTERIOR — TRANSCRIPCIÓN HABLADA",
      focus: "Enfoque",
      reflectionPrompt: "Pregunta de reflexión",
      strengthPrompt: "Pregunta sobre tu fortaleza",
      movePrompt: "Pregunta del Movimiento Heroico",
      affirmation: "Afirmación",
      permission: "Puedes pausar o detenerte en cualquier momento.",
      browserVoice: "Voz del navegador · sin reproducción automática",
    },
    days: [
      { title: "Haz espacio", focus: "Haz una pausa antes de seguir adelante.", reflection: "¿Qué ha estado ocupando más espacio en tu mente o en tu corazón?", strength: "¿Qué te ayuda a sentirte aunque sea un 5 % más centrado o centrada?", move: "Dedica hoy dos minutos de calma: respira, estírate, ora, siéntate o sal al aire libre.", affirmation: "Puedo crear espacio antes de elegir mi próximo paso." },
      { title: "Nombra el momento", focus: "Las palabras claras crean un punto de partida más claro.", reflection: "¿Qué sentimiento, desafío o decisión necesita hoy un nombre honesto?", strength: "¿Qué sabes ahora que antes no sabías?", move: "Completa esta frase: «El verdadero asunto que quiero abordar es…»", affirmation: "Nombrar mi experiencia me ayuda a trabajar con ella." },
      { title: "Mira más a fondo", focus: "La curiosidad es más útil que juzgarte.", reflection: "¿Qué presión, necesidad, miedo o expectativa puede estar influyendo en este momento?", strength: "¿Cuándo has manejado algo parecido con cuidado o valentía?", move: "Escribe un hecho, un sentimiento y una necesidad, sin intentar resolverlos todavía.", affirmation: "Puedo sentir curiosidad por mí sin menospreciarme." },
      { title: "Encuentra tu fortaleza", focus: "La fortaleza también incluye el apoyo al que puedes acudir.", reflection: "¿Qué valor, habilidad, relación o recurso tienes disponible ahora?", strength: "¿Qué te recordaría alguien que cree en ti?", move: "Usa hoy una de tus fortalezas de manera intencional, aunque sea en algo pequeño.", affirmation: "Ya llevo dentro fortalezas que pueden ayudarme a avanzar." },
      { title: "Elige el Movimiento Heroico", focus: "El progreso es posible cuando el siguiente paso es pequeño y específico.", reflection: "¿Qué resultado es más importante y qué está bajo tu control?", strength: "¿Qué fortaleza del Día 4 corresponde a este siguiente paso?", move: "Elige una acción que puedas completar en 15 minutos o menos.", affirmation: "Mi próximo paso no tiene que resolverlo todo para ser importante." },
      { title: "Pide apoyo", focus: "Conectarte con alguien puede ser un acto de valentía.", reflection: "¿Dónde te ayudaría recibir apoyo, seguimiento u otra perspectiva?", strength: "¿Con qué persona segura o recurso confiable puedes comunicarte?", move: "Envía un mensaje, haz una pregunta o programa una conversación.", affirmation: "Pedir apoyo es un Movimiento Heroico poderoso." },
      { title: "Reflexiona para avanzar", focus: "Observa lo que cambió y lleva contigo lo aprendido.", reflection: "¿Qué cambió esta semana en tus pensamientos, sentimientos, decisiones o relaciones?", strength: "¿Qué fortaleza practicaste más?", move: "Escribe en una frase clara tu compromiso para los próximos siete días.", affirmation: "Puedo aprender de esta semana y seguir avanzando con propósito." },
    ],
  },
  {
    code: "fr-FR",
    language: "Français",
    languageEnglish: "French",
    transcriptFileLabel: "Francais",
    ui: {
      kicker: "Expérience guidée gratuite",
      title: "7 jours pour renforcer le héros qui est en vous",
      intro: "Chaque jour propose une réflexion ciblée, une force et une Action Héroïque réalisable. Vos réponses restent dans ce navigateur, sur cet appareil.",
      complete: "terminés",
      day: "Jour",
      daysLabel: "Vos sept jours",
      about: "Environ",
      minutes: "minutes",
      reflect: "Réfléchir",
      findStrength: "Trouver la force",
      heroMove: "Action Héroïque du jour",
      placeholder: "Écrivez l’action avec vos propres mots…",
      previous: "Précédent",
      next: "Suivant",
      completeDay: "Terminer ce jour",
      updateContinue: "Mettre à jour et continuer",
      journeyComplete: "Parcours terminé",
      listen: "Écouter ce jour",
      stop: "Arrêter l’audio",
      listening: "Lecture de la transcription de ce jour",
      downloadTranscript: "Télécharger la transcription du jour",
      transcriptHelp: "Le téléchargement correspond exactement aux mots lus par la voix du navigateur.",
      voiceUnavailable: "Aucune voix de l’appareil ne correspond à cette langue. Vous pouvez toujours lire ou télécharger la transcription.",
      safety: "Ce parcours favorise la réflexion et le développement personnel. Il ne remplace ni une thérapie ni une aide d’urgence.",
      safetyLink: "Consignes de sécurité",
      keepTitle: "Conserver votre parcours",
      keepCopy: "Téléchargez une copie texte ou imprimez cette page en PDF. Effacez-la quand vous le souhaitez.",
      downloadEntries: "Télécharger mes réponses",
      print: "Imprimer / enregistrer en PDF",
      clear: "Effacer le parcours",
      clearConfirm: "Effacer les sept jours de cet appareil ?",
      createdWith: "Créé avec Z-Girl : le système de réflexion du Héros Intérieur.",
      transcriptTitle: "PARCOURS DE 7 JOURS DU HÉROS INTÉRIEUR — TRANSCRIPTION ORALE",
      focus: "Objectif",
      reflectionPrompt: "Question de réflexion",
      strengthPrompt: "Question sur votre force",
      movePrompt: "Question de l’Action Héroïque",
      affirmation: "Affirmation",
      permission: "Vous pouvez faire une pause ou arrêter à tout moment.",
      browserVoice: "Voix du navigateur · sans lecture automatique",
    },
    days: [
      { title: "Créer de l’espace", focus: "Faites une pause avant d’aller plus loin.", reflection: "Qu’est-ce qui occupe le plus de place dans votre esprit ou votre cœur ?", strength: "Qu’est-ce qui vous aide à vous sentir ne serait-ce que 5 % plus stable ?", move: "Accordez-vous deux minutes de calme aujourd’hui : respirez, étirez-vous, priez, asseyez-vous ou sortez.", affirmation: "Je peux créer de l’espace avant de choisir ma prochaine étape." },
      { title: "Nommer le moment", focus: "Des mots clairs donnent un point de départ plus clair.", reflection: "Quel sentiment, défi ou choix a besoin d’être nommé honnêtement aujourd’hui ?", strength: "Que savez-vous maintenant que vous ne saviez pas auparavant ?", move: "Complétez cette phrase : « Le vrai sujet que je veux aborder est… »", affirmation: "Nommer mon expérience m’aide à mieux l’aborder." },
      { title: "Regarder en profondeur", focus: "La curiosité est plus utile que le jugement envers soi-même.", reflection: "Quelle pression, quel besoin, quelle peur ou quelle attente influence peut-être ce moment ?", strength: "Quand avez-vous déjà géré une situation semblable avec attention ou courage ?", move: "Écrivez un fait, un sentiment et un besoin, sans essayer de les résoudre tout de suite.", affirmation: "Je peux m’observer avec curiosité sans me rabaisser." },
      { title: "Trouver votre force", focus: "La force comprend aussi le soutien que vous pouvez solliciter.", reflection: "Quelle valeur, compétence, relation ou ressource est à votre disposition maintenant ?", strength: "Que vous rappellerait une personne qui croit en vous ?", move: "Utilisez consciemment l’une de vos forces aujourd’hui, même modestement.", affirmation: "Je porte déjà en moi des forces qui peuvent m’aider à avancer." },
      { title: "Choisir l’Action Héroïque", focus: "Le progrès devient possible lorsque la prochaine étape est petite et précise.", reflection: "Quel résultat compte le plus, et qu’est-ce qui dépend de vous ?", strength: "Quelle force du Jour 4 peut vous aider dans cette prochaine étape ?", move: "Choisissez une action que vous pouvez réaliser en 15 minutes ou moins.", affirmation: "Ma prochaine étape n’a pas besoin de tout résoudre pour avoir de l’importance." },
      { title: "Demander du soutien", focus: "Créer du lien peut être un acte de courage.", reflection: "Dans quelle situation un soutien, un suivi ou un autre point de vue vous aiderait-il ?", strength: "Quelle personne sûre ou quelle ressource fiable pouvez-vous contacter ?", move: "Envoyez un message, posez une question ou planifiez une conversation.", affirmation: "Demander du soutien est une Action Héroïque puissante." },
      { title: "Réfléchir pour avancer", focus: "Observez ce qui a changé, puis emportez avec vous ce que vous avez appris.", reflection: "Qu’est-ce qui a changé cette semaine dans vos pensées, émotions, choix ou relations ?", strength: "Quelle force avez-vous le plus mise en pratique ?", move: "Écrivez en une phrase claire votre engagement pour les sept prochains jours.", affirmation: "Je peux apprendre de cette semaine et continuer à avancer avec détermination." },
    ],
  },
  {
    code: "pt-BR",
    language: "Português (Brasil)",
    languageEnglish: "Brazilian Portuguese",
    transcriptFileLabel: "Portugues-BR",
    ui: {
      kicker: "Experiência guiada gratuita",
      title: "7 dias para fortalecer o herói que existe em você",
      intro: "A cada dia, uma reflexão focada, uma força e um Movimento Heroico possível. Suas respostas ficam neste navegador e neste dispositivo.",
      complete: "concluídos",
      day: "Dia",
      daysLabel: "Seus sete dias",
      about: "Cerca de",
      minutes: "minutos",
      reflect: "Reflita",
      findStrength: "Encontre a força",
      heroMove: "Movimento Heroico de hoje",
      placeholder: "Escreva a ação com suas próprias palavras…",
      previous: "Anterior",
      next: "Próximo",
      completeDay: "Concluir este dia",
      updateContinue: "Atualizar e continuar",
      journeyComplete: "Jornada concluída",
      listen: "Ouvir este dia",
      stop: "Parar áudio",
      listening: "Reproduzindo a transcrição deste dia",
      downloadTranscript: "Baixar transcrição do dia",
      transcriptHelp: "O arquivo corresponde exatamente às palavras lidas pela voz do navegador.",
      voiceUnavailable: "Não há uma voz do dispositivo disponível para este idioma. Você ainda pode ler ou baixar a transcrição.",
      safety: "Esta jornada apoia a reflexão e o desenvolvimento pessoal. Não é terapia nem atendimento de emergência.",
      safetyLink: "Orientações de segurança",
      keepTitle: "Guarde sua jornada",
      keepCopy: "Baixe uma cópia em texto ou imprima esta página como PDF. Apague quando quiser.",
      downloadEntries: "Baixar minhas respostas",
      print: "Imprimir / salvar PDF",
      clear: "Apagar jornada",
      clearConfirm: "Apagar os sete dias deste dispositivo?",
      createdWith: "Criado com Z-Girl: O Sistema de Reflexão do Herói Interior.",
      transcriptTitle: "JORNADA DE 7 DIAS DO HERÓI INTERIOR — TRANSCRIÇÃO FALADA",
      focus: "Foco",
      reflectionPrompt: "Pergunta para reflexão",
      strengthPrompt: "Pergunta sobre sua força",
      movePrompt: "Pergunta do Movimento Heroico",
      affirmation: "Afirmação",
      permission: "Você pode pausar ou parar a qualquer momento.",
      browserVoice: "Voz do navegador · sem reprodução automática",
    },
    days: [
      { title: "Abra espaço", focus: "Faça uma pausa antes de seguir em frente.", reflection: "O que tem ocupado mais espaço em sua mente ou em seu coração?", strength: "O que ajuda você a se sentir pelo menos 5% mais centrado ou centrada?", move: "Reserve dois minutos de calma hoje: respire, alongue-se, ore, sente-se ou vá para fora.", affirmation: "Eu posso criar espaço antes de escolher meu próximo passo." },
      { title: "Dê um nome ao momento", focus: "Palavras claras criam um ponto de partida mais claro.", reflection: "Que sentimento, desafio ou decisão precisa de um nome honesto hoje?", strength: "O que você sabe agora que não sabia antes?", move: "Complete a frase: “A verdadeira questão que quero enfrentar é…”", affirmation: "Dar um nome à minha experiência me ajuda a lidar com ela." },
      { title: "Olhe mais fundo", focus: "A curiosidade é mais útil do que julgar a si mesmo.", reflection: "Que pressão, necessidade, medo ou expectativa pode estar influenciando este momento?", strength: "Quando você já lidou com algo parecido com cuidado ou coragem?", move: "Escreva um fato, um sentimento e uma necessidade, sem tentar resolvê-los ainda.", affirmation: "Posso olhar para mim com curiosidade sem me diminuir." },
      { title: "Encontre sua força", focus: "A força também inclui o apoio que você pode buscar.", reflection: "Que valor, habilidade, relacionamento ou recurso está disponível para você agora?", strength: "O que alguém que acredita em você lembraria a você?", move: "Use uma de suas forças de propósito hoje, mesmo que seja de uma forma pequena.", affirmation: "Eu já carrego forças que podem me ajudar a seguir em frente." },
      { title: "Escolha o Movimento Heroico", focus: "O progresso se torna possível quando o próximo passo é pequeno e específico.", reflection: "Qual resultado é mais importante e o que está sob seu controle?", strength: "Que força do Dia 4 faz parte deste próximo passo?", move: "Escolha uma ação que você possa concluir em 15 minutos ou menos.", affirmation: "Meu próximo passo não precisa resolver tudo para ter valor." },
      { title: "Peça apoio", focus: "Criar conexão pode ser um ato de coragem.", reflection: "Onde o apoio, o acompanhamento ou outra perspectiva ajudaria?", strength: "Que pessoa segura ou recurso confiável você pode contatar?", move: "Envie uma mensagem, faça uma pergunta ou marque uma conversa.", affirmation: "Pedir apoio é um Movimento Heroico poderoso." },
      { title: "Reflita para seguir em frente", focus: "Observe o que mudou e leve o aprendizado com você.", reflection: "O que mudou nesta semana em seus pensamentos, sentimentos, escolhas ou relacionamentos?", strength: "Que força você mais praticou?", move: "Escreva seu compromisso para os próximos sete dias em uma frase clara.", affirmation: "Posso aprender com esta semana e continuar avançando com propósito." },
    ],
  },
  {
    code: "de-DE",
    language: "Deutsch",
    languageEnglish: "German",
    transcriptFileLabel: "Deutsch",
    ui: {
      kicker: "Kostenlose begleitete Erfahrung",
      title: "7 Tage für einen stärkeren inneren Helden",
      intro: "Jeden Tag gibt es eine gezielte Reflexion, eine Stärke und einen erreichbaren Heldenschritt. Deine Einträge bleiben in diesem Browser auf diesem Gerät.",
      complete: "abgeschlossen",
      day: "Tag",
      daysLabel: "Deine sieben Tage",
      about: "Etwa",
      minutes: "Minuten",
      reflect: "Reflektieren",
      findStrength: "Stärke finden",
      heroMove: "Heutiger Heldenschritt",
      placeholder: "Beschreibe die Handlung mit deinen eigenen Worten…",
      previous: "Zurück",
      next: "Weiter",
      completeDay: "Diesen Tag abschließen",
      updateContinue: "Aktualisieren und weiter",
      journeyComplete: "Reise abgeschlossen",
      listen: "Diesen Tag anhören",
      stop: "Audio stoppen",
      listening: "Die Abschrift dieses Tages wird vorgelesen",
      downloadTranscript: "Tagesabschrift herunterladen",
      transcriptHelp: "Der Download entspricht genau den Wörtern, die von der Browserstimme vorgelesen werden.",
      voiceUnavailable: "Für diese Sprache ist keine passende Gerätestimme verfügbar. Du kannst die Abschrift trotzdem lesen oder herunterladen.",
      safety: "Diese Reise unterstützt Reflexion und persönliche Entwicklung. Sie ist keine Therapie oder Notfallhilfe.",
      safetyLink: "Sicherheitshinweise",
      keepTitle: "Deine Reise behalten",
      keepCopy: "Lade eine Textkopie herunter oder drucke diese Seite als PDF. Du kannst sie jederzeit löschen.",
      downloadEntries: "Meine Einträge herunterladen",
      print: "Drucken / als PDF speichern",
      clear: "Reise löschen",
      clearConfirm: "Alle sieben Tage von diesem Gerät löschen?",
      createdWith: "Erstellt mit Z-Girl: Das Reflexionssystem für den inneren Helden.",
      transcriptTitle: "7-TAGE-REISE ZUM INNEREN HELDEN — GESPROCHENE ABSCHRIFT",
      focus: "Fokus",
      reflectionPrompt: "Reflexionsfrage",
      strengthPrompt: "Frage zu deiner Stärke",
      movePrompt: "Frage zum Heldenschritt",
      affirmation: "Bestärkung",
      permission: "Du kannst jederzeit pausieren oder aufhören.",
      browserVoice: "Browserstimme · keine automatische Wiedergabe",
    },
    days: [
      { title: "Raum schaffen", focus: "Halte inne, bevor du weitergehst.", reflection: "Was nimmt gerade den meisten Raum in deinen Gedanken oder deinem Herzen ein?", strength: "Was hilft dir, dich auch nur 5 % geerdeter zu fühlen?", move: "Nimm dir heute zwei ruhige Minuten: Atme, dehne dich, bete, sitze still oder gehe nach draußen.", affirmation: "Ich kann Raum schaffen, bevor ich meinen nächsten Schritt wähle." },
      { title: "Den Moment benennen", focus: "Klare Worte schaffen einen klareren Ausgangspunkt.", reflection: "Welches Gefühl, welche Herausforderung oder Entscheidung braucht heute einen ehrlichen Namen?", strength: "Was weißt du jetzt, das du vorher nicht wusstest?", move: "Vervollständige den Satz: „Das eigentliche Thema, das ich angehen möchte, ist …“", affirmation: "Meine Erfahrung zu benennen hilft mir, mit ihr umzugehen." },
      { title: "Tiefer schauen", focus: "Neugier ist hilfreicher als Selbstverurteilung.", reflection: "Welcher Druck, welches Bedürfnis, welche Angst oder Erwartung könnte diesen Moment beeinflussen?", strength: "Wann hast du etwas Ähnliches schon einmal mit Sorgfalt oder Mut bewältigt?", move: "Schreibe eine Tatsache, ein Gefühl und ein Bedürfnis auf, ohne sie jetzt schon lösen zu wollen.", affirmation: "Ich kann mir selbst neugierig begegnen, ohne mich niederzumachen." },
      { title: "Deine Stärke finden", focus: "Stärke schließt auch die Unterstützung ein, die du erreichen kannst.", reflection: "Welcher Wert, welche Fähigkeit, Beziehung oder Ressource steht dir jetzt zur Verfügung?", strength: "Woran würde dich jemand erinnern, der an dich glaubt?", move: "Setze heute bewusst eine deiner Stärken ein, auch wenn es nur im Kleinen ist.", affirmation: "Ich trage bereits Stärken in mir, die mir beim Weitergehen helfen können." },
      { title: "Den Heldenschritt wählen", focus: "Fortschritt wird möglich, wenn der nächste Schritt klein und konkret ist.", reflection: "Welches Ergebnis ist am wichtigsten, und was liegt in deiner Kontrolle?", strength: "Welche Stärke aus Tag 4 gehört zu diesem nächsten Schritt?", move: "Wähle eine Handlung, die du in höchstens 15 Minuten erledigen kannst.", affirmation: "Mein nächster Schritt muss nicht alles lösen, um wichtig zu sein." },
      { title: "Um Unterstützung bitten", focus: "Verbindung kann ein mutiger Schritt sein.", reflection: "Wo würden Unterstützung, Verbindlichkeit oder eine andere Perspektive helfen?", strength: "Welche sichere Person oder verlässliche Anlaufstelle kannst du kontaktieren?", move: "Sende eine Nachricht, stelle eine Frage oder vereinbare ein Gespräch.", affirmation: "Um Unterstützung zu bitten ist ein kraftvoller Heldenschritt." },
      { title: "Nach vorn reflektieren", focus: "Nimm wahr, was sich verändert hat, und trage das Gelernte weiter.", reflection: "Was hat sich diese Woche in deinen Gedanken, Gefühlen, Entscheidungen oder Beziehungen verändert?", strength: "Welche Stärke hast du am meisten geübt?", move: "Schreibe dein Vorhaben für die nächsten sieben Tage in einem klaren Satz auf.", affirmation: "Ich kann aus dieser Woche lernen und zielgerichtet weitergehen." },
    ],
  },
];

export function getJourneyTrack(code: JourneyLocale): JourneyTrack {
  return JOURNEY_TRACKS.find((track) => track.code === code) ?? JOURNEY_TRACKS[0];
}

export function getDayTranscript(track: JourneyTrack, dayIndex: number): string {
  const day = track.days[dayIndex];
  const { ui } = track;
  return [
    `${ui.day} ${dayIndex + 1} ${track.code === "de-DE" ? "von" : track.code === "fr-FR" ? "sur" : track.code === "pt-BR" ? "de" : track.code === "es-US" ? "de" : "of"} 7. ${day.title}.`,
    `${ui.focus}: ${day.focus}`,
    `${ui.reflectionPrompt}: ${day.reflection}`,
    `${ui.strengthPrompt}: ${day.strength}`,
    `${ui.movePrompt}: ${day.move}`,
    `${ui.affirmation}: ${day.affirmation}`,
    ui.safety,
    ui.permission,
  ].join("\n\n");
}
